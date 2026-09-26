import Router from '@koa/router';
import { tokenAuthMiddleware } from 'common/middlewares/tokenAuthMiddleware';
import { checkIsRootMiddleware } from 'common/middlewares/user/checkIsRootMiddleware';
import Koa from "koa";
import { Context } from '../types/index.js';

/**
 * URL prefix /broker
 */
export default () => {
    let api = new Router<Koa.DefaultState, Context>();

    api.get("/",
        tokenAuthMiddleware(),
        checkIsRootMiddleware(),
        async (ctx) => {
            const data = await ctx.brokerService.getData();

            ctx.body = {
                data: data.extractNullable()
            }
        }
    )

    return api;
}

// export const a = () =>
//     resource({
//         mergeParams: true,
//         middlewares: {
//             index: [tokenAuthMIddleware(), checkIsRoot()],
//         },
//         /** GET / - List all users in system
//          * @restriction regular user - list only userNames, admin - list all users
//          * @header Authorization-JWT
//          */
//         async index(req: Request, res) {
//             const data = await req.context.brokerService.getData();

//             res.send({
//                 data: data.extractNullable()
//             });
//         },
//     });
