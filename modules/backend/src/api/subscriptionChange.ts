import fieldDescriptors from 'common/fieldDescriptors';
import { UserModel } from 'common/models/userModel';
import Router from '@koa/router';
import Koa from "koa"
import { formDataMiddleware } from 'common/middlewares/formDataMiddleware';
import { Context } from '../types/index.js';

/**
 * URL prefix /subscriptionChange
 */

export default () => {
    let api = new Router<Koa.DefaultState, Context>();

    api.patch("/", formDataMiddleware(fieldDescriptors, { allowedForms: ["MODIFY_PUSH_SUBSCRIPTION"] }), async (ctx) => {
        const { formData } = ctx.request.body || {};

        if (formData?.MODIFY_PUSH_SUBSCRIPTION) {
            await UserModel.modifyNotifyToken(formData.MODIFY_PUSH_SUBSCRIPTION.old, formData.MODIFY_PUSH_SUBSCRIPTION.new);
            ctx.status = 204
        } else {
            ctx.status = 400
        }
    })

    return api;
}

// export default () =>
//     resource({
//         middlewares: {
//             modify: [
//                 formDataChecker(fieldDescriptors, { allowedForms: ["MODIFY_PUSH_SUBSCRIPTION"] }),
//             ],
//         },
//         async modify({ body }: Request, res) {
//             const { formData } = body;

//             if (formData.MODIFY_PUSH_SUBSCRIPTION) {
//                 await UserModel.modifyNotifyToken(formData.MODIFY_PUSH_SUBSCRIPTION.old, formData.MODIFY_PUSH_SUBSCRIPTION.new);
//                 res.sendStatus(204);
//             } else {
//                 res.sendStatus(400);
//             }
//         },
//     });
