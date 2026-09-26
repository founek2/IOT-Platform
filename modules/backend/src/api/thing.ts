import Router from '@koa/router';
import { fieldDescriptors, logger } from 'common';
import { controlDevicePermissionMiddleware } from 'common/middlewares/device/controlDevicePermissionMiddleware';
import { writeDevicePermissionMiddleware } from 'common/middlewares/device/writeDevicePermissionMiddleware';
import { formDataMiddleware } from 'common/middlewares/formDataMiddleware';
import { tokenAuthMiddleware } from 'common/middlewares/tokenAuthMiddleware';
import { DeviceModel } from 'common/models/deviceModel';
import { IDevice } from 'common/models/interface/device';
import { getProperty } from 'common/utils/getProperty';
import { getThing } from 'common/utils/getThing';
import { sendError } from 'common/utils/sendError';
import { validateValue } from 'common/utils/validateValue';
import Koa from "koa";
import { Context } from '../types/index.js';
import { ObjectId } from '../utils/objectId.js';

/**
 * URL prefix /device/:deviceId/thing/:nodeId
 */
export default () => {
    let api = new Router<Koa.DefaultState, Context>();

    api.post("/",
        tokenAuthMiddleware(),
        controlDevicePermissionMiddleware({ paramKey: 'deviceId' }),
        async (ctx) => {
            const { deviceId, nodeId } = ctx.params;
            logger.silly("Set property", ctx.params, ctx.query)

            const doc: IDevice = await DeviceModel.findById(deviceId).lean();
            const thing = getThing(doc, nodeId);

            const propertyId = ctx.query.property as string;
            const value = ctx.query.value as string;
            if (!propertyId || !value) return ctx.status = 400;

            const property = getProperty(thing, propertyId);
            const result = validateValue(property, Buffer.from(value));
            if (!result.valid) return ctx.status = 400;

            (await ctx.actionsService.deviceSetProperty(nodeId, propertyId, value, doc))
                ? ctx.status = 204
                : ctx.status = 400
        }
    )

    api.put("/",
        tokenAuthMiddleware(),
        writeDevicePermissionMiddleware({ paramKey: 'deviceId' }),
        formDataMiddleware(fieldDescriptors, { allowedForms: ["EDIT_THING"] }),
        async (ctx) => {
            const { formData } = ctx.request.body;
            const config = formData.EDIT_THING.config;

            const device = await DeviceModel.findById(ctx.params.deviceId);
            if (!device) return sendError(404, 'deviceNotFound', ctx);

            await DeviceModel.updateOne({
                _id: ObjectId(ctx.params.deviceId),
                "things._id": ObjectId(ctx.params.nodeId),
            }, {
                "things.$.config": config,
            })

            ctx.status = 204
        })


    return api;
}

// export const a = () =>
//     resource({
//         mergeParams: true,
//         middlewares: {
//             // create: [tokenAuthMIddleware(), checkControlPerm({ paramKey: 'deviceId' })],
//             replace: [
//                 tokenAuthMIddleware(),
//                 checkWritePerm({ paramKey: 'deviceId' }),
//                 formDataChecker(fieldDescriptors, { allowedForms: ["EDIT_THING"] })
//             ],
//         },

//         async index(req: Request, res) {
//             res.send('Z bezpečnostích důvodů není metoda GET podporována. Použijte matodu POST.');
//         },

//         async create({ params, query, context }: RequestQuery & HasContext, res) {
//             const { deviceId, nodeId } = params;
//             logger.silly("Set property", params, query)

//             const doc: IDevice = await DeviceModel.findById(deviceId).lean();
//             const thing = getThing(doc, nodeId);

//             const propertyId = query.property;
//             const value = query.value;
//             if (!propertyId || !value) return res.sendStatus(400);

//             const property = getProperty(thing, propertyId);
//             const result = validateValue(property, Buffer.from(value));
//             if (!result.valid) return res.sendStatus(400);

//             (await context.actionsService.deviceSetProperty(nodeId, propertyId, value, doc))
//                 ? res.sendStatus(204)
//                 : res.sendStatus(400);
//         },

//         async replace({ params: { deviceId, nodeId }, body }: Request, res) {
//             const { formData } = body;
//             const config = formData.EDIT_THING.config;

//             const device = await DeviceModel.findById(deviceId);
//             if (!device) return res.sendStatus(404);

//             await DeviceModel.updateOne({
//                 _id: ObjectId(deviceId),
//                 "things._id": ObjectId(nodeId),
//             }, {
//                 "things.$.config": config,
//             })

//             res.sendStatus(204)
//         },
//     });
