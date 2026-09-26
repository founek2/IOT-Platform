import { logger } from "common/logger";
import { IDevice } from "common/models/interface/device";
import { INotify, INotifyThingProperty } from "common/models/interface/notifyInterface";
import { IThing, IThingProperty } from "common/models/interface/thing";
import { PushSubscription, IUser } from "common/models/interface/userInterface"
import { NotifyModel } from "common/models/notifyModel";
import { UserModel } from "common/models/userModel";
import { getProperty } from "common/utils/getProperty";
import { getThing } from "common/utils/getThing";
import { uniq } from "ramda";
import webpush from "web-push"
import functions from "./notification/functions.js";
import { renderTemplate } from "./notification/templateEngine.js";
import { NotifyService } from "./notifyService.js";

type VibratePattern = number | number[];
type NotificationDirection = "auto" | "ltr" | "rtl";

export interface NotificationAction {
    action: string;
    icon?: string;
    title: string;
}

export interface Notification {
    title: string
    actions?: NotificationAction[];
    badge?: string;
    body?: string;
    data?: any;
    dir?: NotificationDirection;
    icon?: string;
    image?: string;
    lang?: string;
    renotify?: boolean;
    requireInteraction?: boolean;
    silent?: boolean;
    tag?: string;
    timestamp?: number;
    vibrate?: VibratePattern;
}

export class NotificationService {
    homepageUrl: string;

    constructor({ publicVapidKey, privateVapidKey, emailVapid, homepageUrl }: { publicVapidKey: string, privateVapidKey: string, emailVapid: string, homepageUrl: string }) {
        webpush.setVapidDetails(`mailto:${emailVapid}`, publicVapidKey, privateVapidKey)
        this.homepageUrl = homepageUrl;
    }

    sendNotification(payload: Notification, subscription: PushSubscription) {
        return webpush.sendNotification(subscription, JSON.stringify(payload));
    }


    /**
     * Process all notification set by all users on provided property with current value
    */
    async processData(
        device: IDevice,
        nodeId: IThing['config']['nodeId'],
        propertyId: IThingProperty['propertyId'],
        value: string | number
    ) {
        const deviceThing = getThing(device, nodeId);
        const property = getProperty(deviceThing, propertyId);

        const docs = await NotifyModel.getForProperty(device._id, nodeId, propertyId, device.permissions.write);
        if (docs.length === 0) return;

        const output: Output = {};
        const sended: { _id: INotify['_id']; userId: IUser['_id']; prop_id: IThingProperty['_id'] }[] = [];
        const notSended: {
            unSatisfiedItems: { _id: INotify['_id']; prop_id: IThingProperty['_id'] }[];
            satisfiedItems: { _id: INotify['_id']; prop_id: IThingProperty['_id'] }[];
        } = { unSatisfiedItems: [], satisfiedItems: [] };

        docs.forEach(({ _id, userId, things }) => {
            logger.silly("_id", _id, "user", userId)
            // per USER
            things.forEach((thing) =>
                thing.properties.forEach(
                    processNotifications(_id, userId, value, output, sended, notSended, {
                        deviceThing,
                        property,
                    }, device, deviceThing._id, this.homepageUrl)
                )
            );
        });

        // Notify.refreshControlItems(deviceId, sended, notSended);
        NotifyService.refreshSendedItems(sended, nodeId);
        NotifyService.refreshNotSendedItems(notSended, nodeId);

        const invalidTokens: PreparedNotification[] = [];
        const validTokens: PreparedNotification[] = [];

        const notificationsToSend = await prepareNotifications(output, sended);
        const results = await Promise.all(notificationsToSend.map((data) => this.sendNotification(data.notification, data.subscription).then((result) => ({ result })).catch((err: webpush.WebPushError) => ({ result: err }))))
        results.forEach(({ result }, idx) => {
            if (result.statusCode == 410) {
                invalidTokens.push(notificationsToSend[idx]);
            } else if (200 <= result.statusCode && result.statusCode < 299) {
                validTokens.push(notificationsToSend[idx]);
            } else {
                logger.error("Unexpected web push status", result.statusCode, result.body)
            }
        })

        logger.debug(validTokens.length + ' of ' + results.length + ' notifications were sent successfully');


        const deleteResults = await Promise.all(invalidTokens.map(({ userId, subscription }) =>
            UserModel.removeSubscription(userId, subscription)
        ))
        if (deleteResults.length) logger.debug('Deleted push subscriptions>', deleteResults.length)

    }
}

interface CreateNotificationsOptions {
    title: string;
    body: string,
    click_action: string,
}
function createNotification({ title, body, click_action }: CreateNotificationsOptions) {
    return {
        title,
        body,
        icon: '/favicon.png',
        click_action,
    };
}

type Output = { [userId: string]: { title: string; body: string; icon: string; click_action: string }[] };


async function getSubscriptionsPerUser(IDs: string[]) {
    // const promises: Promise<{ pushSubscriptions: PushSubscription[] }>[] = [];
    const userIds: string[] = [];
    const promises = IDs.map((userID) => UserModel.getSubscriptions(userID));

    return Promise.all(promises);
}

function isLastSatisfied(tmp: INotifyThingProperty['tmp']) {
    return tmp && tmp.lastSatisfied === true;
}

function processNotifications(
    _id: INotify['_id'],
    userID: IUser['_id'],
    value: number | string,
    output: Output,
    sended: { _id: IThingProperty['_id']; userId: IUser['_id']; prop_id: IThingProperty['_id'] }[],
    notSended: {
        unSatisfiedItems: { _id: INotify['_id']; prop_id: IThingProperty['_id'] }[];
        satisfiedItems: { _id: INotify['_id']; prop_id: IThingProperty['_id'] }[];
    },
    data: { property: IThingProperty, deviceThing: IThing },
    device: IDevice,
    thingId: IThing['_id'],
    homepageUrl: string,
) {
    return ({ type, value: limit, advanced, _id: prop_id, textTemplate, tmp }: INotifyThingProperty) => {
        /* Check validity */
        const result = functions[type](value, limit, advanced, tmp);
        if (result.ruleSatisfied) {
            if (result.valid) {
                if (!output[userID]) output[userID] = [];

                output[userID].push(createNotification({
                    title: data.deviceThing.config.name,
                    body: renderTemplate(textTemplate || "${property.name} je ${value}", { ...data, value }),
                    click_action: `${homepageUrl}/building/${device.info.location.building}/room/${device.info.location.room}?thingId=${thingId}`,
                }));
                sended.push({ _id, userId: userID, prop_id });
            } else {
                if (isLastSatisfied(tmp)) notSended.satisfiedItems.push({ _id, prop_id });
            }
        } else {
            if (isLastSatisfied(tmp)) notSended.unSatisfiedItems.push({ _id, prop_id });
        }
    };
}
async function prepareNotifications(output: Output, sended: { _id: IThingProperty['_id']; userId: IUser['_id'] }[]) {
    const userIds = sended.map((item) => item.userId);
    const uniqIds = uniq(userIds);
    const arrOfTokensPerUser = await getSubscriptionsPerUser(uniqIds);

    return buildNotifications(arrOfTokensPerUser, output);
}

type PreparedNotification = { subscription: PushSubscription, notification: Notification, userId: string };
/**
 *
 * @param {Array} arrOfTokens - array of objects {_id: ..., notifyTokens: []}
 * @param {Object} objPerUser - userID as key and array of notifications as value
 */
async function buildNotifications(arrOfTokens: (Pick<IUser, "_id" | "pushSubscriptions">)[], objPerUser: Record<IUser["_id"], Notification[]>) {
    const messages: PreparedNotification[] = [];
    arrOfTokens.forEach(({ pushSubscriptions, _id: userId }) => {
        pushSubscriptions?.forEach((subscription) => {
            const notifications = objPerUser[userId];
            notifications.forEach((notification) => {
                // TODO neposkládat do jedné notifikace maybe?
                messages.push({
                    notification,
                    subscription,
                    userId: userId,
                });
            });
        });
    });

    return messages
}
