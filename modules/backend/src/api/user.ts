import Router from '@koa/router';
import { getAllowedGroups } from 'common/constants/privileges';
import fieldDescriptors from 'common/fieldDescriptors';
import { formDataMiddleware } from 'common/middlewares/formDataMiddleware';
import { rateLimiterMiddleware } from 'common/middlewares/rateLimiterMiddleware';
import { tokenAuthMiddleware } from 'common/middlewares/tokenAuthMiddleware';
import checkWritePermissionMiddleware from 'common/middlewares/user/checkWritePermissionMiddleware';
import { IUser } from 'common/models/interface/userInterface';
import { TokenModel } from 'common/models/tokenModel';
import { UserModel } from 'common/models/userModel';
import type Koa from "koa";
import eventEmitter from '../services/eventEmitter.js';
import { Context } from '../types/index.js';

function removeUserItself(id: IUser['_id']) {
    return function (doc: IUser) {
        return doc._id != id; // dont change to !==
    };
}

/**
 * URL prefix /user
 */
export default () => {
    let api = new Router<Koa.DefaultState, Context>();

    api.get("/",
        tokenAuthMiddleware(),
        async (ctx) => {
            const { user, root } = ctx.state;
            const { type } = ctx.query;

            if (user && type === 'userName') {
                // tested
                const docs = await UserModel.findAllUserNames();
                ctx.body = { data: docs.map(({ _id, info: { userName } }) => ({ _id, userName })) }
            } else if (root) {
                const docs = await UserModel.findAll();
                ctx.body = { docs: docs.filter(removeUserItself(user._id)).map((obj) => obj.toObject()) };
            } else if (user && user.admin) {
                // tested
                const docs = await UserModel.findAllNotRoot();
                ctx.body = { docs: docs.filter(removeUserItself(user._id)).map((obj) => obj.toObject()) };
            } else if (user && !user.admin) {
                ctx.status = 403
                ctx.body = { error: 'InvalidPermissions' }
            } else ctx.status = 500
        })

    // public
    api.get("/:id",
        async (ctx) => {
            const { id } = ctx.params;
            const { attribute } = ctx.query;

            if (attribute === 'authType') {
                const doc = await UserModel.findByUserName(id);
                if (!doc) ctx.body = { authTypes: [] };
                else ctx.body = { authTypes: doc.auth.types };
            } else {
                ctx.status = 400;
            }
        })

    // public
    api.post("/",
        rateLimiterMiddleware,
        formDataMiddleware(fieldDescriptors, {
            allowedForms: ['REGISTRATION', 'FORGOT', 'FORGOT_PASSWORD'],
        }),
        async (ctx) => {
            const { userService } = ctx
            const { formData } = ctx.request.body || {};

            if (formData?.REGISTRATION) {
                if (await UserModel.exists({ 'info.userName': formData.REGISTRATION.info.userName })) {
                    ctx.status = 409
                    ctx.body = { error: 'userNameAlreadyExist' }
                    return
                }
                if (await UserModel.exists({ 'info.email': formData.REGISTRATION.info.email })) {
                    ctx.status = 409
                    ctx.body = { error: 'emailAlreadyExist' }
                    return
                }

                const { doc } = await userService.create(formData.REGISTRATION);
                const tokens = await userService.createTokens(doc, ctx.request.headers["user-agent"] || "")

                tokens.ifRight(({ accessToken, refreshToken }) => {
                    ctx.body = {
                        user: doc,
                        accessToken,
                        refreshToken
                    }
                    eventEmitter.emit('user_signup', { id: doc._id, info: doc.info });
                }).ifLeft(error => {
                    ctx.status = 400
                    ctx.body = { error }
                })
            } else if (formData?.FORGOT) {
                eventEmitter.emit('user_forgot', { email: formData.FORGOT.email });
                ctx.status = 204
            } else if (formData?.FORGOT_PASSWORD) {
                const token = await TokenModel.retrieve(formData.FORGOT_PASSWORD.token);
                if (!token) return ctx.status = 400;

                (await userService.changePassword(token.userId, formData.FORGOT_PASSWORD.password))
                    .ifRight(() => ctx.status = 204)
                    .ifLeft((error) => {
                        ctx.status = 400
                        ctx.body = { error }
                    });
            } else {
                ctx.status = 400
            }
        })

    api.put("/:id",
        tokenAuthMiddleware(),
        checkWritePermissionMiddleware(),
        formDataMiddleware(fieldDescriptors, { allowedForms: ['EDIT_USER', 'ADD_PUSH_SUBSCRIPTION'] }),
        async (ctx) => {
            const { id } = ctx.params;
            const { user } = ctx.state;
            const body = ctx.body;

            if (body.formData.EDIT_USER) {
                const allowedGroups = getAllowedGroups(user.groups);
                if (!body.formData.EDIT_USER.groups.every((group: string) => allowedGroups.includes(group)))
                    return ctx.status = 403;

                (await ctx.userService.updateUser(id, body.formData.EDIT_USER))
                    .ifRight(() => ctx.status = 204)
                    .ifLeft((error) => {
                        ctx.status = 400
                        ctx.body = { error }
                    });
            } else if (body.formData.FIREBASE_ADD) {
                await UserModel.addNotifyToken(id, body.formData.FIREBASE_ADD.token);
                ctx.status = 204
            } else if (body.formData.ADD_PUSH_SUBSCRIPTION) {
                await UserModel.addNotifyToken(id, body.formData.ADD_PUSH_SUBSCRIPTION);
                ctx.status = 204
            } else ctx.status = 400
        }
    )

    api.delete("/:id",
        tokenAuthMiddleware(),
        checkWritePermissionMiddleware(),
        async (ctx) => {
            await ctx.userService.deleteById(ctx.params.id);
            ctx.status = 204;
        }
    )

    return api;

}

// export function a() {
//     resource({
//         middlewares: {
//             // index: [tokenAuthMIddleware()],
//             // create: [
//             //     rateLimiterMiddleware,
//             //     formDataChecker(fieldDescriptors, {
//             //         allowedForms: ['REGISTRATION', 'FORGOT', 'FORGOT_PASSWORD'],
//             //     }),
//             // ],
//             // replaceId: [
//             //     tokenAuthMIddleware(),
//             //     checkWritePerm(),
//             //     formDataChecker(fieldDescriptors, { allowedForms: ['EDIT_USER', "ADD_PUSH_SUBSCRIPTION"] }),
//             // ],
//             deleteId: [tokenAuthMIddleware(), checkWritePerm()],
//         },
//         /** GET / - List all users in system
//          * @restriction regular user - list only userNames, admin - list all users
//          * @header Authorization-JWT
//          * @param type optional, specify property of user, supported: userName
//          * @return json
//          *              - type == userName { data: { _id: string, userName: string }[] }
//          *              - default { users: IUser[] }
//          */
//         // async index({ user, root, query: { type } }: RequestIndex, res) {
//         //     if (user && type === 'userName') {
//         //         // tested
//         //         const docs = await UserModel.findAllUserNames();
//         //         res.send({ data: docs.map(({ _id, info: { userName } }) => ({ _id, userName })) });
//         //     } else if (root) {
//         //         const docs = await UserModel.findAll();
//         //         res.send({ docs: docs.filter(removeUserItself(user._id)).map((obj) => obj.toObject()) });
//         //     } else if (user && user.admin) {
//         //         // tested
//         //         const docs = await UserModel.findAllNotRoot();
//         //         res.send({ docs: docs.filter(removeUserItself(user._id)).map((obj) => obj.toObject()) });
//         //     } else if (user && !user.admin) {
//         //         res.status(403).send({ error: 'InvalidPermissions' });
//         //     } else res.sendStatus(500);
//         // },

//         /** GET /:id - Return an user attribute
//          * @param attribute specify an user atribute, supported: AuthType
//          * @return json { authType: AuthType }
//          */
//         // async read({ params, query }: RequestRead, res) {
//         //     const { id } = params;
//         //     const { attribute } = query;

//         //     if (attribute === 'authType') {
//         //         const doc = await UserModel.findByUserName(id);
//         //         if (!doc) res.send({ authTypes: [] });
//         //         else res.send({ authTypes: doc.auth.types });
//         //     } else {
//         //         res.sendStatus(400);
//         //     }
//         // },

//         /** POST / - Do something based on body content
//          * @body form
//          * - LOGIN check provided credentials
//          * - REGISTRATION register new user
//          * - FORGOT send email with link to change password
//          * - FORGOT_PASSWORD - change password to user determined by one time use token
//          * @return json
//          * - LOGIN | REGISTRATION { user: IUser, token: JwtToken }
//          */
//         // async create(req: Request & HasContext, res) {
//         //     const { userService } = req.context
//         //     const { formData } = req.body;

//         //     if (formData.REGISTRATION) {
//         //         if (await UserModel.exists({ 'info.userName': formData.REGISTRATION.info.userName }))
//         //             return res.status(409).send({ error: 'userNameAlreadyExist' });
//         //         if (await UserModel.exists({ 'info.email': formData.REGISTRATION.info.email })) {
//         //             console.log(await UserModel.find());
//         //             return res.status(409).send({ error: 'emailAlreadyExist' });
//         //         }

//         //         const { doc } = await userService.create(formData.REGISTRATION);
//         //         const tokens = await userService.createTokens(doc, req.headers["user-agent"] || "")

//         //         tokens.ifRight(({ accessToken, refreshToken }) => {
//         //             res.send({
//         //                 user: doc,
//         //                 accessToken,
//         //                 refreshToken
//         //             });
//         //             eventEmitter.emit('user_signup', { id: doc._id, info: doc.info });
//         //         }).ifLeft(error => {
//         //             res.sendStatus(400).send({ error });
//         //         })
//         //     } else if (formData.FORGOT) {
//         //         eventEmitter.emit('user_forgot', { email: formData.FORGOT.email });
//         //         res.sendStatus(204);
//         //     } else if (formData.FORGOT_PASSWORD) {
//         //         const token = await TokenModel.retrieve(formData.FORGOT_PASSWORD.token);
//         //         if (!token) return res.sendStatus(400);

//         //         (await userService.changePassword(token.userId, formData.FORGOT_PASSWORD.password))
//         //             .ifRight(() => res.sendStatus(204))
//         //             .ifLeft((error) => res.status(400).send({ error }));
//         //     } else {
//         //         res.sendStatus(400);
//         //     }
//         // },

//         /** DELETE /:id - Delete provided user
//          * @restriction user is admin or is deleting himself
//          * @header Authorization-JWT
//          */
//         // async deleteId({ params, context }: RequestId, res) {
//         //     await context.userService.deleteById(params.id);
//         //     res.sendStatus(204);
//         // },

//         // async replaceId({ body, params, user, context }: RequestId, res) {
//         //     const { id } = params;
//         //     if (body.formData.EDIT_USER) {
//         //         const allowedGroups = getAllowedGroups(user.groups);
//         //         if (!body.formData.EDIT_USER.groups.every((group: string) => allowedGroups.includes(group)))
//         //             return res.sendStatus(403);

//         //         (await context.userService.updateUser(id, body.formData.EDIT_USER))
//         //             .ifRight(() => res.sendStatus(204))
//         //             .ifLeft((error) => res.status(400).send({ error }));
//         //     } else if (body.formData.FIREBASE_ADD) {
//         //         await UserModel.addNotifyToken(id, body.formData.FIREBASE_ADD.token);
//         //         res.sendStatus(204);
//         //     } else if (body.formData.ADD_PUSH_SUBSCRIPTION) {
//         //         await UserModel.addNotifyToken(id, body.formData.ADD_PUSH_SUBSCRIPTION);
//         //         res.sendStatus(204);
//         //     } else res.sendStatus(400);
//         // },
//     });
// }