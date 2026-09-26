import { compose, lensProp, over, pick } from 'ramda';
import { Config } from '../config.js';
import Router from '@koa/router';
import { Context } from '../types/index.js';
import Koa from "koa"
import { tokenAuthMiddleware } from 'common/middlewares/tokenAuthMiddleware';
import { checkIsRootMiddleware } from 'common/middlewares/user/checkIsRootMiddleware';

/**
 * URL prefix /config
 */
export default (config: Config) => {
    let api = new Router<Koa.DefaultState, Context>();

    api.get("/",
        tokenAuthMiddleware(),
        checkIsRootMiddleware(),
        async (ctx) => {
            const picked = pick(['port', 'portAuth', 'bodyLimit', 'homepage', 'jwt', 'agenda', 'email'], config);

            const data = compose(
                // @ts-ignore
                over(lensProp('email'), pick(['host', 'port', 'secure', 'userName'])),
                // @ts-ignore
                over(lensProp('mqtt'), pick(['url', 'port'])),
                // @ts-ignore
            )(picked);

            ctx.body = { data };
        }
    )

    return api;
}

// export const a = (config: Config) =>
//     resource({
//         mergeParams: true,
//         middlewares: {
//             index: [tokenAuthMIddleware(), checkIsRoot()],
//         },
//         /** GET / - List all users in system
//          * @restriction regular user - list only userNames, admin - list all users
//          * @header Authorization-JWT
//          */
//         async index(req, res) {
//             const picked = pick(['port', 'portAuth', 'bodyLimit', 'homepage', 'jwt', 'agenda', 'email'], config);

//             const data = compose(
//                 over(lensProp('email'), pick(['host', 'port', 'secure', 'userName'])),
//                 // @ts-ignore
//                 over(lensProp('mqtt'), pick(['url', 'port'])),
//                 // @ts-ignore
//             )(picked);
//             res.send({ data });
//         },

//         // async create({ body, user }: any, res) {
//         //     const doc = await UserService.createAccessToken(body.formData.ADD_ACCESS_TOKEN, user._id);
//         //     res.send({ doc });
//         // },

//         // async modifyId({ body, user, params }: any, res) {
//         //     await UserService.updateAccessToken(params.id, user._id, body.formData.EDIT_ACCESS_TOKEN);
//         //     res.sendStatus(204);
//         // },

//         // async deleteId({ user, params }: any, res) {
//         //     await UserService.deleteAccessToken(params.id, user._id);
//         //     res.sendStatus(204);
//         // },
//     });
