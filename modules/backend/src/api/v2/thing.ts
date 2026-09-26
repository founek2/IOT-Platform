import Router from '@koa/router';
import { checkRealmControlPermissionMiddleware } from 'common/middlewares/device/checkRealmControlPermissionMiddleware';
import { checkRealmReadPermissionMiddleware } from 'common/middlewares/device/checkRealmReadPermissionMiddleware';
import { tokenAuthMiddleware } from 'common/middlewares/tokenAuthMiddleware';
import { DeviceModel } from 'common/models/deviceModel';
import { getProperty } from 'common/utils/getProperty';
import { getThing } from 'common/utils/getThing';
import { validateValue } from 'common/utils/validateValue';
import Koa from "koa";
import { Context } from '../../types/index.js';

/**
 * URL prefix /device/:deviceId/thing/:nodeId
 */
export default () => {
    let api = new Router<Koa.DefaultState, Context>();

    api.get("/",
        tokenAuthMiddleware(),
        checkRealmReadPermissionMiddleware({ paramKey: 'deviceId' }),
        async (ctx) => {
            ctx.body = 'Z bezpečnostích důvodů není metoda GET podporována. Použijte matodu POST pro ovládání nebo odeberte query parametry z url.';
            ctx.status = 405
        }
    )

    api.post("/",
        tokenAuthMiddleware(),
        checkRealmControlPermissionMiddleware({ paramKey: 'deviceId' }),
        async (ctx) => {
            const { realm, deviceId, nodeId } = ctx.params;

            const doc = await DeviceModel.findByRealm(realm, deviceId);
            if (!doc) return ctx.status = 404

            const thing = getThing(doc, nodeId);

            const propertyId = ctx.query.property as string;
            const value = ctx.query.value as string;

            if (!propertyId || !value) return ctx.status = 400

            const property = getProperty(thing, propertyId);
            const result = validateValue(property, Buffer.from(value));
            if (!result.valid) return ctx.status = 400;

            (await ctx.actionsService.deviceSetProperty(nodeId, propertyId, value, doc))
                ? ctx.status = 200
                : ctx.status = 400
        }
    )

    return api;
}

// export const a = () =>
//     resource({
//         mergeParams: true,
//         middlewares: {
//             create: [tokenAuthMIddleware(), checkRealmControlPerm({ paramKey: 'deviceId' })],
//             index: [tokenAuthMIddleware(), checkRealmReadPerm({ paramKey: 'deviceId' })],
//         },

//         async index(req: Request, res) {
//             return res.send('Z bezpečnostích důvodů není metoda GET podporována. Použijte matodu POST pro ovládání nebo odeberte query parametry z url.');
//         },

//         async create({ params, query, context }: RequestQuery & HasContext, res) {
//             const { realm, deviceId, nodeId } = params;

//             const doc = await DeviceModel.findByRealm(realm, deviceId);
//             if (!doc) return res.sendStatus(404);

//             const thing = getThing(doc, nodeId);

//             const propertyId = query.property;
//             const value = query.value;

//             if (!propertyId || !value) return res.sendStatus(400);

//             const property = getProperty(thing, propertyId);
//             const result = validateValue(property, Buffer.from(value));
//             if (!result.valid) return res.sendStatus(400);

//             (await context.actionsService.deviceSetProperty(nodeId, propertyId, value, doc))
//                 ? res.sendStatus(200)
//                 : res.sendStatus(400);
//         },
//     });
