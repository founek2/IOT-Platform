import Router from '@koa/router';
import { fieldDescriptors } from 'common';
import { formDataMiddleware } from 'common/middlewares/formDataMiddleware';
import { tokenAuthMiddleware } from 'common/middlewares/tokenAuthMiddleware';
import checkWritePermissionMiddleware from 'common/middlewares/user/checkWritePermissionMiddleware';
import { UserModel } from 'common/models/userModel';
import type Koa from "koa";
import { map, omit } from 'ramda';
import { Context } from '../types/index.js';
import { ObjectId } from '../utils/objectId.js';

/**
 * URL prefix /user/:userId/accessToken
 */

export default () => {
    let api = new Router<Koa.DefaultState, Context>();

    api.get("/",
        tokenAuthMiddleware(),
        checkWritePermissionMiddleware({ paramKey: 'userId' }),
        async (ctx) => {
            const doc = await UserModel.findOne({ _id: new ObjectId(ctx.state.user._id) })
                .select('accessTokens')
                .lean();
            if (!doc) return ctx.status = 404;

            ctx.body = { docs: map(omit(['token']), doc.accessTokens || []) };
        })

    api.post("/",
        tokenAuthMiddleware(),
        checkWritePermissionMiddleware({ paramKey: 'userId' }),
        formDataMiddleware(fieldDescriptors, { allowedForms: ['ADD_ACCESS_TOKEN'] }),
        async (ctx) => {
            const token = await ctx.userService.createAccessToken(ctx.request.body.formData.ADD_ACCESS_TOKEN, ctx.state.user._id);
            token
                .ifRight((doc) => ctx.body = { doc })
                .ifLeft((error) => {
                    ctx.status = 500
                    ctx.body = { error }
                });
        })

    api.patch("/:id",
        tokenAuthMiddleware(),
        checkWritePermissionMiddleware({ paramKey: 'userId' }),
        formDataMiddleware(fieldDescriptors, { allowedForms: ['EDIT_ACCESS_TOKEN'] }),
        async (ctx) => {
            await ctx.userService.updateAccessToken(ctx.params.id, ctx.state.user._id, ctx.request.body.formData.EDIT_ACCESS_TOKEN);
            ctx.status = 204
        })

    api.delete("/:id",
        tokenAuthMiddleware(),
        checkWritePermissionMiddleware({ paramKey: 'userId' }),
        async (ctx) => {
            await ctx.userService.deleteAccessToken(ctx.params.id, ctx.state.user._id);
            ctx.status = 204
        })

    return api;
}

// export function a() {
//     resource({
//         mergeParams: true,
//         middlewares: {
//             // index: [tokenAuthMIddleware(), checkWritePerm({ paramKey: 'userId' })],
//             // create: [
//             //     tokenAuthMIddleware(),
//             //     checkWritePerm({ paramKey: 'userId' }),
//             //     formDataChecker(fieldDescriptors, { allowedForms: ['ADD_ACCESS_TOKEN'] }),
//             // ],
//             deleteId: [tokenAuthMIddleware(), checkWritePerm({ paramKey: 'userId' })],
//             // modifyId: [
//             //     tokenAuthMIddleware(),
//             //     checkWritePerm({ paramKey: 'userId' }),
//             //     formDataChecker(fieldDescriptors, { allowedForms: ['EDIT_ACCESS_TOKEN'] }),
//             // ],
//         },
//         // /** GET / - List all users in system
//         //  * @restriction regular user - list only userNames, admin - list all users
//         //  * @header Authorization-JWT
//         //  */
//         // async index({ user }: Request, res) {
//         //     const doc = await UserModel.findOne({ _id: ObjectId(user._id) })
//         //         .select('accessTokens')
//         //         .lean();
//         //     if (!doc) return res.sendStatus(404);

//         //     res.send({ docs: map(omit(['token']), doc.accessTokens || []) });
//         // },

//         // async create({ body, user, context }: Request & HasContext, res) {
//         //     const token = await context.userService.createAccessToken(body.formData.ADD_ACCESS_TOKEN, user._id);
//         //     token.ifRight((doc) => res.send({ doc })).ifLeft((error) => res.status(500).send({ error }));
//         // },

//         // async modifyId({ body, user, params, context }: RequestId & HasContext, res) {
//         //     await context.userService.updateAccessToken(params.id, user._id, body.formData.EDIT_ACCESS_TOKEN);
//         //     res.sendStatus(204);
//         // },

//         async deleteId({ user, params, context }: RequestId & HasContext, res) {
//             await context.userService.deleteAccessToken(params.id, user._id);
//             res.sendStatus(204);
//         },
//     });
// }