import fieldDescriptors from 'common/lib/fieldDescriptors';
import { NotifyModel } from 'common/lib/models/notifyModel';
import { transformNotifyForBE } from 'common/lib/utils/transform';
import { tokenAuthMiddleware } from 'common/lib/middlewares/tokenAuthMiddleware';
import Router from '@koa/router';
import Koa from "koa"
import { Context } from '../types/index';
import { formDataMiddleware } from 'common/lib/middlewares/formDataMiddleware';
import { readDevicePermissionMiddleware } from 'common/lib/middlewares/device/readDevicePermissionMiddleware';

/**
 * URL prefix /device/:deviceId/thing/:nodeId/notify
 */
export default () => {
    let api = new Router<Koa.DefaultState, Context>();

    api.get("/",
        tokenAuthMiddleware(),
        readDevicePermissionMiddleware({ paramKey: 'deviceId' }),
        async (ctx) => {
            const { deviceId, nodeId } = ctx.params;
            if (!deviceId || !nodeId) return ctx.status = 400;

            const doc = await NotifyModel.getForThing(deviceId, nodeId, ctx.state.user._id);
            ctx.body = {
                doc: {
                    thing: doc && doc.things ? doc.things[0] : { nodeId, properties: [] },
                },
            };
        }
    )
    api.put("/",
        tokenAuthMiddleware(),
        readDevicePermissionMiddleware({ paramKey: 'deviceId' }),
        formDataMiddleware(fieldDescriptors, { allowedForms: ['EDIT_NOTIFY'] }),
        async (ctx) => {
            const { deviceId, nodeId } = ctx.params;
            const { formData } = ctx.request.body;

            if (formData.EDIT_NOTIFY) {
                const { properties } = transformNotifyForBE(formData.EDIT_NOTIFY);

                await NotifyModel.setForThing(deviceId, nodeId, ctx.state.user._id, properties);
                ctx.status = 204
            } else ctx.status = 400
        })

    return api;
}


// export default () =>
//     resource({
//         mergeParams: true,
//         middlewares: {
//             replace: [
//                 tokenAuthMIddleware(),
//                 checkWritePerm({ paramKey: 'deviceId' }),
//                 formDataChecker(fieldDescriptors),
//             ],
//             index: [tokenAuthMIddleware(), checkReadPerm({ paramKey: 'deviceId' })],
//         },

//         /** GET / - List all notification rules associated with provided thing of device
//          * @restriction user needs read permission
//          * @header Authorization-JWT
//          * @return json { doc: { thing: INotifyThing[] } }
//          */
//         async index({ params, user }: Request, res) {
//             const { deviceId, nodeId } = params;
//             if (!deviceId || !nodeId) return res.sendStatus(400);

//             const doc = await NotifyModel.getForThing(deviceId, nodeId, user._id);
//             res.send({
//                 doc: {
//                     thing: doc && doc.things ? doc.things[0] : { nodeId, properties: [] },
//                 },
//             });
//         },

//         /** PUT / - Replace all notification rules associated with provided thing of device
//          * @restriction user needs read permission
//          * @header Authorization-JWT
//          * @body form EDIT_NOTIFY
//          */
//         async replace({ params, body: { formData }, user }: Request, res) {
//             const { deviceId, nodeId } = params;

//             if (formData.EDIT_NOTIFY) {
//                 const { properties } = transformNotifyForBE(formData.EDIT_NOTIFY);

//                 await NotifyModel.setForThing(deviceId, nodeId, user._id, properties);
//                 res.sendStatus(204);
//             } else res.sendStatus(400);
//         },
//     });
