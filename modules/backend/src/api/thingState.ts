import { DeviceModel } from 'common/models/deviceModel';
import { getThing } from 'common/utils/getThing';
import Router from '@koa/router';
import Koa from "koa"
import { Context } from '../types/index.js';
import { readDevicePermissionMiddleware } from "common/middlewares/device/readDevicePermissionMiddleware"
import { tokenAuthMiddleware } from 'common/middlewares/tokenAuthMiddleware';

/**
 * URL prefix /device/:deviceId/thing/:nodeId/state
 */
export default () => {
    let api = new Router<Koa.DefaultState, Context>();

    api.patch("/",
        tokenAuthMiddleware(),
        readDevicePermissionMiddleware({ paramKey: 'deviceId' }),
        async (ctx) => {
            const device = await DeviceModel.findById(ctx.params.deviceId);
            const thing = getThing(device!, ctx.params.nodeId);
            if (!thing) return ctx.status = 404

            ctx.body = thing.state;
        })

    return api;
}

// export default () =>
//     resource({
//         mergeParams: true,
//         middlewares: {
//             index: [tokenAuthMIddleware(), checkReadPerm({ paramKey: 'deviceId' })],
//         },

//         async index({ params: { deviceId, nodeId } }: Request, res) {
//             const device = await DeviceModel.findById(deviceId);
//             const thing = getThing(device!, nodeId);
//             if (!thing) return res.sendStatus(404);

//             return thing.state;
//         },
//     });
