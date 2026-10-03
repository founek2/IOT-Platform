import Router from '@koa/router';
import { fieldDescriptors, logger, UserModel } from 'common';
import { formDataMiddleware } from 'common/middlewares/formDataMiddleware';
import { rateLimiterMiddleware } from 'common/middlewares/rateLimiterMiddleware';
import { tokenAuthMiddleware } from 'common/middlewares/tokenAuthMiddleware';
import { OAuthProvider } from 'common/models/interface/userInterface';
import Koa from "koa";
import { EitherAsync } from 'purify-ts';
import eventEmitter from '../services/eventEmitter.js';
import { Context, KoaResponseContext } from '../types/index.js';

export default function (): Router<Koa.DefaultState, Context> {
    const router = new Router<Koa.DefaultState, Context>();

    type OAuthItem = { provider: string, iconUrl: string, authUrl: string };
    router.get("/", (ctx: KoaResponseContext<{ oauth: OAuthItem[] }>) => {
        const oauthArray: OAuthItem[] = [];
        const { clientId, endpoint, scopes, iconUrl } = ctx.oauthService.oauth.seznam;
        oauthArray.push({
            provider: 'seznam',
            iconUrl,
            authUrl: `${endpoint}?client_id=${clientId}&scope=${scopes.join('%20')}&response_type=code`,
        });

        ctx.body = { oauth: oauthArray }
    })

    router.post("/",
        rateLimiterMiddleware,
        formDataMiddleware(fieldDescriptors, { allowedForms: ['AUTHORIZATION', 'LOGIN'] }),
        async (ctx) => {
            const formData = ctx.request.body?.formData;

            if (formData?.LOGIN) {
                (await ctx.userService.checkAndCreateCreditals(formData.LOGIN, ctx.headers["user-agent"] || ""))
                    .ifLeft((error) => {
                        logger.error(error)
                        ctx.status = 401;
                        ctx.body = { error }
                    })
                    .ifRight(({ doc, accessToken, refreshToken }) => {
                        ctx.body = {
                            user: doc.toObject(),
                            accessToken,
                            refreshToken,
                        };
                        eventEmitter.emit('user_login', doc);
                    });
            } else if (formData?.AUTHORIZATION) {
                const oauthMaybe = await ctx.oauthService.requestAuthorization(
                    formData.AUTHORIZATION.code,
                    formData.AUTHORIZATION.redirectUri,
                    OAuthProvider.seznam
                )

                const oauthEither = oauthMaybe.toEither("unexpectedError")

                const process = EitherAsync
                    .liftEither(oauthEither)
                    .chain((auth) =>
                        ctx.userService.refreshOauthAuthorization(
                            auth.email,
                            auth.email.replace(/@.*$/, '').replace(/\./g, ''),
                            {
                                accessToken: auth.access_token,
                                expiresIn: auth.expires_in,
                                refreshToken: auth.refresh_token,
                                tokenType: auth.token_type,
                                provider: OAuthProvider.seznam,
                            },
                            ctx.headers["user-agent"] || ""
                        )
                    ).ifRight(({ doc, accessToken, refreshToken, oldOauth }) => {
                        ctx.body = { user: doc, accessToken, refreshToken };
                        eventEmitter.emit('user_login', doc);

                        if (oldOauth)
                            ctx.oauthService.revokeToken(
                                oldOauth.accessToken,
                                oldOauth.refreshToken,
                                'refresh_token',
                                oldOauth.provider
                            );
                    }).ifLeft(() =>
                        ctx.status = 500
                    );
                await process.run();
            } else ctx.status = 400
        }
    )

    router.delete("/:id",
        tokenAuthMiddleware(),
        async (ctx) => {
            const refreshTokenId = ctx.params.id;

            const result = await UserModel.invalidateRefreshToken(ctx.state.user._id, refreshTokenId)
            if (result.modifiedCount !== 1) {
                ctx.status = 404;
            } else {
                ctx.status = 204
            }
        }
    )

    return router;
}

// /**
//  * URL prefix /authorization
//  */
// export default () =>
//     resource({
//         mergeParams: true,
//         middlewares: {
//             create: [
//                 rateLimiterMiddleware,
//                 formDataChecker(fieldDescriptors, { allowedForms: ['AUTHORIZATION', 'LOGIN'] }),
//             ],
//             deleteId: [tokenAuth()]
//         },

//         async index(req: Request & HasContext, res) {
//             const oauthArray: Array<any> = [];
//             if (req.context.oauthService) {
//                 const { clientId, endpoint, scopes, iconUrl } = req.context.oauthService.oauth.seznam;
//                 oauthArray.push({
//                     provider: 'seznam',
//                     iconUrl,
//                     authUrl: `${endpoint}?client_id=${clientId}&scope=${scopes.join('%20')}&response_type=code`,
//                 });
//             }

//             res.send({
//                 oauth: oauthArray,
//             });
//         },

//         async create({ body, context, headers }: Request & HasContext, res) {
//             const { formData } = body;

//             if (formData.LOGIN) {
//                 (await context.userService.checkAndCreateCreditals(formData.LOGIN, headers["user-agent"] || ""))
//                     .ifLeft((error) => {
//                         logger.error(error)
//                         res.status(401).send({ error })
//                     })
//                     .ifRight(({ doc, accessToken, refreshToken }) => {
//                         res.send({
//                             user: doc,
//                             accessToken,
//                             refreshToken,
//                         });
//                         eventEmitter.emit('user_login', doc);
//                     });
//             } else if (formData.AUTHORIZATION) {
//                 const oauthMaybe = await context.oauthService.requestAuthorization(
//                     body.formData.AUTHORIZATION.code,
//                     body.formData.AUTHORIZATION.redirectUri,
//                     OAuthProvider.seznam
//                 )

//                 const oauthEither = oauthMaybe.toEither("unexpectedError")

//                 EitherAsync
//                     .liftEither(oauthEither)
//                     .chain((auth) =>
//                         context.userService.refreshOauthAuthorization(
//                             auth.email,
//                             auth.email.replace(/@.*$/, '').replace(/\./g, ''),
//                             {
//                                 accessToken: auth.access_token,
//                                 expiresIn: auth.expires_in,
//                                 refreshToken: auth.refresh_token,
//                                 tokenType: auth.token_type,
//                                 provider: OAuthProvider.seznam,
//                             },
//                             headers["user-agent"] || ""
//                         )
//                     ).ifRight(({ doc, accessToken, refreshToken, oldOauth }) => {
//                         res.send({ user: doc, accessToken, refreshToken });
//                         eventEmitter.emit('user_login', doc);

//                         if (oldOauth)
//                             context.oauthService.revokeToken(
//                                 oldOauth.accessToken,
//                                 oldOauth.refreshToken,
//                                 'refresh_token',
//                                 oldOauth.provider
//                             );
//                     }).ifLeft(() => res.sendStatus(500))
//                     .run()
//             } else res.sendStatus(400);
//         },

//         async deleteId({ user, params }: RequestWithAuth<{ id: string }>, res) {
//             const refreshTokenId = params.id;

//             const result = await UserModel.invalidateRefreshToken(user._id, refreshTokenId)
//             if (result.nModified !== 1) return res.sendStatus(404)

//             res.sendStatus(204)
//         }
//     });
