import { UserModel } from 'common';
import { Context } from '../types/index.js';
import { UAParser } from 'ua-parser-js';
import { tokenAuthMiddleware } from 'common/middlewares/tokenAuthMiddleware';
import Router from '@koa/router';
import type Koa from "koa"

export default () => {
    let api = new Router<Koa.DefaultState, Context>();

    api.get("/", tokenAuthMiddleware(), async (ctx) => {
        const doc = await UserModel.findById(ctx.state.user._id).lean()
        if (!doc) return ctx.status = 404

        const activeRefreshTokens = (doc.refreshTokens || [])
            .filter((t) => t.validTo ? t.validTo.getTime() > Date.now() : true)
            .map(t => ({
                ...t,
                userAgent: t.userAgent ? new UAParser(t.userAgent).getResult() : undefined,
            }))

        ctx.body = {
            activeRefreshTokens
        }
    })

    return api;
}

// /**
//  * URL prefix /authorization
//  */
// export default () =>
//     resource({
//         mergeParams: true,
//         middlewares: {
//             index: [tokenAuth()]
//         },

//         async index({ user }: RequestWithAuth & HasContext, res) {
//             const doc = await UserModel.findById(user._id).lean()
//             if (!doc) return res.sendStatus(404);

//             const activeRefreshTokens = (doc.refreshTokens || [])
//                 .filter((t) => t.validTo ? t.validTo.getTime() > Date.now() : true)
//                 .map(t => ({
//                     ...t,
//                     userAgent: t.userAgent ? new UAParser(t.userAgent).getResult() : undefined,
//                 }))

//             res.send({
//                 activeRefreshTokens
//             })
//         },

//     });
