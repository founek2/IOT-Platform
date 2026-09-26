import mongoose, { Model, Document } from "mongoose";
import { INotify, INotifyThingProperty } from "./interface/notifyInterface.js";
import { notifyThingSchema } from "./schema/notifySchema.js";
import { IDevice } from "./interface/device.js";
import { IThing, IThingProperty } from "./interface/thing.js";
import { IUser } from "./interface/userInterface.js";
import { INTERNAL_NOTIFY_PROPERTIES, INTERNAL_THING_ID } from "../constants/index.js";
import { NotifyType } from "./interface/notifyInterface.js"
import { pushOrNewArray } from "../utils/pushOrNewArray.js";

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

export interface INotifyDocument extends INotify, Document { }

export interface INotifyModel extends Model<INotifyDocument> {
    getForThing(
        deviceId: IDevice["_id"],
        nodeId: IThing["config"]["nodeId"],
        userId: IUser["_id"]
    ): Promise<INotifyDocument | null>;
    setForThing(
        deviceId: IDevice["_id"],
        nodeId: IThing["config"]["nodeId"],
        userId: IUser["_id"],
        properties: INotifyThingProperty[]
    ): Promise<void>;
    getForProperty(
        deviceId: IDevice["_id"],
        nodeId: IThing["config"]["nodeId"],
        propertyId: IThingProperty["propertyId"],
        userIds: IDevice['permissions']['write']
    ): Promise<INotifyDocument[]>;
}

const notifySchema = new Schema<INotifyDocument, INotifyModel>({
    deviceId: { type: ObjectId, ref: "Device" },
    userId: { type: ObjectId, ref: "User" },
    things: [notifyThingSchema],
});

notifySchema.statics.getForThing = async function (
    deviceId: IDevice["_id"],
    nodeId: IThing["config"]["nodeId"],
    userId: IUser["_id"]
) {
    return this.findOne(
        {
            deviceId: ObjectId(deviceId),
            userId: ObjectId(userId),
            "things.nodeId": nodeId,
        },
        "things.$"
    );
};

notifySchema.statics.setForThing = async function (
    deviceId: IDevice["_id"],
    nodeId: IThing["config"]["nodeId"],
    userId: IUser["_id"],
    properties: INotifyThingProperty[]
) {
    const result = await this.updateOne(
        {
            deviceId: ObjectId(deviceId),
            userId: ObjectId(userId),
            "things.nodeId": nodeId,
        },
        {
            "things.$.properties": properties,
        }
    );

    if (result.n === 0)
        return this.updateOne(
            {
                deviceId: ObjectId(deviceId),
                userId: ObjectId(userId),
            },
            {
                $push: {
                    things: {
                        nodeId,
                        properties,
                    },
                },
            },
            { upsert: true }
        );
    return result;
};

notifySchema.statics.getForProperty = async function (
    deviceId: IDevice["_id"],
    nodeId: IThing["config"]["nodeId"],
    propertyId: IThingProperty["propertyId"],
    userIds: IDevice['permissions']['write']
) {
    const docs = await this.find(
        {
            deviceId: ObjectId(deviceId),
            "things.nodeId": nodeId,
            "things.properties.propertyId": propertyId,
        },
        "things.$ deviceId userId"
    ).lean();

    // Make sure internal notifications are present
    if (nodeId === INTERNAL_THING_ID && docs.length != userIds.length) {
        await Promise.all(userIds.map(userId => {
            return this.setForThing(deviceId, nodeId, userId, INTERNAL_NOTIFY_PROPERTIES)
        }))

        return this.getForProperty(deviceId, nodeId, propertyId, userIds);
    }

    return docs.map((doc) => ({
        _id: doc._id,
        userId: doc.userId,
        deviceId: doc.deviceId,
        things: doc.things.map((thing) => ({
            nodeId: thing.nodeId,
            properties: thing.properties.filter((property) => property.propertyId === propertyId),
        })),
    }));
};

export const NotifyModel = mongoose.model<INotifyDocument, INotifyModel>("Notify_v3", notifySchema);
