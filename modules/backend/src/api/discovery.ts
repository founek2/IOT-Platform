import Router from '@koa/router';
import { UserModel } from 'common';
import fieldDescriptors from 'common/fieldDescriptors';
import { checkDiscoveryMiddleware } from "common/middlewares/discovery/checkDiscoveryMiddleware";
import { formDataMiddleware } from 'common/middlewares/formDataMiddleware';
import { tokenAuthMiddleware } from 'common/middlewares/tokenAuthMiddleware';
import { DiscoveryModel, IDiscoveryDocument } from 'common/models/deviceDiscoveryModel';
import { DeviceModel } from 'common/models/deviceModel';
import { DeviceStatus } from 'common/models/interface/device';
import { IThing } from 'common/models/interface/thing';
import { sendError } from "common/utils/sendError";
import Koa from "koa";
import mongoose from 'mongoose';
import { assocPath, map } from 'ramda';
import eventEmitter from '../services/eventEmitter.js';
import { Context } from '../types/index.js';
import { convertDiscoveryThing } from '../utils/convertDiscoveryThing.js';

const ObjectId = mongoose.Types.ObjectId;


/**
 * URL prefix /discovery
 */
export default () => {
    let api = new Router<Koa.DefaultState, Context>();

    api.get("/", tokenAuthMiddleware(), async (ctx) => {
        const userDoc = await UserModel.findById(ctx.state.user._id).lean()
        if (!userDoc) return ctx.status = 404

        const docs = await DiscoveryModel.find({
            'state.status.value': {
                $exists: true,
            },
            realm: userDoc.realm,
            pairing: { $ne: true },
        });

        ctx.body = { docs };
    })

    api.delete("/:id", tokenAuthMiddleware(), checkDiscoveryMiddleware(), async (ctx) => {
        const { id } = ctx.params;

        const result = await DiscoveryModel.deleteMany({
            _id: ObjectId(id),
        });

        eventEmitter.emit('device_delete', id);
        ctx.status = 204;
    })

    api.post("/:id",
        tokenAuthMiddleware(),
        checkDiscoveryMiddleware(),
        formDataMiddleware(fieldDescriptors, { allowedForms: ['CREATE_DEVICE'] }),
        async (ctx) => {
            console.log("body", ctx.request.body)
            const { formData } = ctx.request.body;
            const _id = ctx.params.id;
            const user = ctx.state.user;
            const form = formData.CREATE_DEVICE;

            const discoverdDevice = (await DiscoveryModel.findOne({
                // check if discovered device is Ready and not already pairing
                _id: ObjectId(_id),
                pairing: { $ne: true },
                'state.status.value': DeviceStatus.ready,
            })) as IDiscoveryDocument;
            if (!discoverdDevice) return sendError(400, 'deviceNotReady', ctx);

            // convert discovered device to new device
            const convertThings = map(convertDiscoveryThing);
            const things = convertThings(
                map(
                    (nodeId) => assocPath(['config', 'nodeId'], nodeId, discoverdDevice.things[nodeId]),
                    discoverdDevice.nodeIds
                )
            );

            async function getOrCreateDevice(doc: IDiscoveryDocument, things: IThing[], form: any) {
                const metadata = {
                    realm: doc.realm,
                    deviceId: doc.deviceId,
                };

                const alreadyExist = await DeviceModel.findOneAndUpdate(
                    { metadata },
                    { info: form.info, things },
                    { new: true }
                ).lean();
                if (alreadyExist) return alreadyExist;

                return DeviceModel.createNew(
                    {
                        info: form.info,
                        things,
                        metadata,
                    },
                    user._id
                );
            }

            const newDevice = await getOrCreateDevice(discoverdDevice, things, form);
            if (!newDevice) return sendError(400, 'deviceIdTaken', ctx);

            await ctx.actionsService.deviceInitPairing(newDevice); // initialize pairing proccess

            discoverdDevice.pairing = true;
            discoverdDevice.save();
            ctx.body = { doc: newDevice };
        })

    return api;
}

// export const a = () =>
//     resource({
//         middlewares: {
//             // index: [tokenAuthMIddleware()],
//             // deleteId: [tokenAuthMIddleware(), checkDiscovery()],
//             // createId: [
//             //     tokenAuthMIddleware(),
//             //     checkDiscovery(),
//             //     formDataChecker(fieldDescriptors, { allowedForms: ['CREATE_DEVICE'] }),
//             // ],
//         },

//         /** GET / - List all discovered devices for user
//          * @header Authorization-JWT
//          * @return json { docs: IDiscovery[] }
//          */
//         async index({ user }: Request, res) {
//             const userDoc = await UserModel.findById(user._id).lean()
//             if (!userDoc) return res.sendStatus(404)

//             const docs = await DiscoveryModel.find({
//                 'state.status.value': {
//                     $exists: true,
//                 },
//                 realm: userDoc.realm,
//                 pairing: { $ne: true },
//             });

//             res.send({ docs });
//         },

//         /** GET /:id - Delete provided discovered device
//          * @restriction device was discovered for this user
//          * @header Authorization-JWT
//          */
//         async deleteId({ params }: RequestId, res) {
//             const { id } = params;

//             const result = await DiscoveryModel.deleteMany({
//                 _id: ObjectId(id),
//             });

//             eventEmitter.emit('device_delete', id);
//             res.sendStatus(204);
//         },

//         /** POST /:id - Create new device based on the one discovered (specified by param id)
//          * @restriction device was discovered for this user
//          * @header Authorization-JWT
//          * @body form CREATE_DEVICE
//          * @return json { doc: IDevice }
//          */
//         async createId({ body, user, params, context }: RequestId & HasContext, res) {
//             const { formData } = body;
//             const _id = params.id;
//             const form = formData.CREATE_DEVICE;

//             const discoverdDevice = (await DiscoveryModel.findOne({
//                 // check if discovered device is Ready and not already pairing
//                 _id: ObjectId(_id),
//                 pairing: { $ne: true },
//                 'state.status.value': DeviceStatus.ready,
//             })) as IDiscoveryDocument;
//             if (!discoverdDevice) return res.status(400).send({ error: 'deviceNotReady' });

//             // convert discovered device to new device
//             const convertThings = map(convertDiscoveryThing);
//             const things = convertThings(
//                 map(
//                     (nodeId) => assocPath(['config', 'nodeId'], nodeId, discoverdDevice.things[nodeId]),
//                     discoverdDevice.nodeIds
//                 )
//             );

//             async function getOrCreateDevice(doc: IDiscoveryDocument, things: IThing[], form: any) {
//                 const metadata = {
//                     realm: doc.realm,
//                     deviceId: doc.deviceId,
//                 };

//                 const alreadyExist = await DeviceModel.findOneAndUpdate(
//                     { metadata },
//                     { info: form.info, things },
//                     { new: true }
//                 ).lean();
//                 if (alreadyExist) return alreadyExist;

//                 return DeviceModel.createNew(
//                     {
//                         info: form.info,
//                         things,
//                         metadata,
//                     },
//                     user._id
//                 );
//             }

//             const newDevice = await getOrCreateDevice(discoverdDevice, things, form);
//             if (!newDevice) return res.status(400).send({ error: 'deviceIdTaken' });

//             await context.actionsService.deviceInitPairing(newDevice); // initialize pairing proccess

//             discoverdDevice.pairing = true;
//             discoverdDevice.save();
//             res.send({ doc: newDevice });
//         },
//     });
