import fieldDescriptors from 'common/fieldDescriptors';
import { UserModel } from 'common/models/userModel';
import Router from '@koa/router';
import type Koa from "koa"
import checkWritePermissionMiddleware from 'common/middlewares/user/checkWritePermissionMiddleware';
import { tokenAuthMiddleware } from 'common/middlewares/tokenAuthMiddleware';
import { Context } from '../types/index.js';
import { formDataMiddleware } from 'common/middlewares/formDataMiddleware';

/**
 * URL prefix /user
 */

export default () => {
    let api = new Router<Koa.DefaultState, Context>();

    api.post("/",
        tokenAuthMiddleware(),
        checkWritePermissionMiddleware({ paramKey: 'userId' }),
        formDataMiddleware(fieldDescriptors, { allowedForms: ["ADD_PUSH_SUBSCRIPTION"] }),
        async (ctx) => {
            const { formData } = ctx.request.body;

            if (formData.ADD_PUSH_SUBSCRIPTION) {
                await UserModel.addNotifyToken(ctx.state.user._id, formData.ADD_PUSH_SUBSCRIPTION);
                ctx.status = 204
            } else {
                ctx.status = 400
            }
        })

    return api;
}

// export function a() {
//     resource({
//         mergeParams: true,
//         middlewares: {
//             create: [
//                 tokenAuthMIddleware(),
//                 checkWritePerm({ paramKey: 'userId' }),
//                 formDataChecker(fieldDescriptors, { allowedForms: ["ADD_PUSH_SUBSCRIPTION"] }),
//             ],
//         },

//         async create({ body, user }: Request, res) {
//             const { formData } = body;

//             if (formData.ADD_PUSH_SUBSCRIPTION) {
//                 await UserModel.addNotifyToken(user._id, formData.ADD_PUSH_SUBSCRIPTION);
//                 res.sendStatus(204);
//             } else {
//                 res.sendStatus(400);
//             }
//         },
//     });
// }