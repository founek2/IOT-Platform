import fieldDescriptors from 'common/fieldDescriptors';
import { UserModel } from 'common/models/userModel';
import Router from '@koa/router';
import type Koa from "koa"
import checkWritePermissionMiddleware from 'common/middlewares/user/checkWritePermissionMiddleware';
import checkReadPermissionMiddleware from 'common/middlewares/user/checkReadPermissionMiddleware';
import { tokenAuthMiddleware } from 'common/middlewares/tokenAuthMiddleware';
import { Context } from '../types/index.js';
import { formDataMiddleware } from 'common/middlewares/formDataMiddleware';

/**
 * URL prefix /user
 */

export default () => {
    let api = new Router<Koa.DefaultState, Context>();

    api.get("/",
        tokenAuthMiddleware(),
        checkReadPermissionMiddleware({ paramKey: 'userId' }),
        async (ctx) => {
            const doc = await UserModel.findById(ctx.params.userId).select('dashboard').lean();
            ctx.body = { dashboard: doc?.dashboard ?? { preferences: [] } };
        })

    api.post("/",
        tokenAuthMiddleware(),
        checkWritePermissionMiddleware({ paramKey: 'userId' }),
        formDataMiddleware(fieldDescriptors, { allowedForms: ["USER_DASHBOARD"] }),
        async (ctx) => {
            const { userId } = ctx.params;
            const { formData } = ctx.request.body;

            if (formData.USER_DASHBOARD) {
                await UserModel.setUserDashboard(userId, formData.USER_DASHBOARD);
                ctx.status = 204
            } else {
                ctx.status = 400
            }
        })

    return api;
}