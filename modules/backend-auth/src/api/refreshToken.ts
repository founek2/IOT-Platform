import Router from '@koa/router';
import { fieldDescriptors } from 'common';
import { formDataMiddleware } from "common/middlewares/formDataMiddleware";
import { rateLimiterMiddleware } from 'common/middlewares/rateLimiterMiddleware';
import Koa from "koa";
import { Context } from '../types/index.js';

/**
 * URL prefix /authorization
 */
export default function () {
    const router = new Router<Koa.DefaultState, Context>();

    router.post("/",
        rateLimiterMiddleware,
        formDataMiddleware(fieldDescriptors, { allowedForms: ['REFRESH_TOKEN'] }),
        async (ctx) => {
            const form = ctx.request.body?.formData.REFRESH_TOKEN;
            if (!form) {
                ctx.status = 400
                return
            }

            (await ctx.userService.refreshToken(form.token))
                .ifLeft((error) => {
                    ctx.body = { error }
                    ctx.status = 401
                })
                .ifRight(({ accessToken }) => {
                    ctx.body = { accessToken }
                });
        }
    )

    return router;
}
// export default () =>
//     resource({
//         mergeParams: true,
//         middlewares: {
//             create: [
//                 rateLimiterMiddleware,
//                 formDataChecker(fieldDescriptors, { allowedForms: ['REFRESH_TOKEN'] }),
//             ],
//         },

//         async create({ body, context }: Request & HasContext, res) {
//             const { formData } = body;

//             if (formData.REFRESH_TOKEN) {
//                 (await context.userService.refreshToken(formData.REFRESH_TOKEN.token))
//                     .ifLeft((error) => res.status(401).send({ error }))
//                     .ifRight(({ accessToken }) => {
//                         res.send({
//                             accessToken,
//                         });
//                     });
//             } else res.sendStatus(400);
//         },
//     });
