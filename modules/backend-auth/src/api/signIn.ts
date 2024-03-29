import { fieldDescriptors, logger, UserModel } from 'common';
import { OAuthProvider } from 'common/lib/models/interface/userInterface';
import { MaybeAsync } from 'purify-ts/MaybeAsync';
import formDataChecker from 'common/lib/middlewares/formDataChecker';
import { rateLimiterMiddleware } from 'common/lib/middlewares/rateLimiter';
import resource from 'common/lib/middlewares/resource-router-middleware';
import eventEmitter from '../services/eventEmitter';
import { Request } from 'express';
import { HasContext } from '../types';
import { EitherAsync } from 'purify-ts';
import tokenAuth from 'common/lib/middlewares/tokenAuth';
import { RequestWithAuth } from 'common/lib/types';

/**
 * URL prefix /authorization
 */
export default () =>
    resource({
        mergeParams: true,
        middlewares: {
            create: [
                rateLimiterMiddleware,
                formDataChecker(fieldDescriptors, { allowedForms: ['AUTHORIZATION', 'LOGIN'] }),
            ],
            deleteId: [tokenAuth()]
        },

        async index(req: Request & HasContext, res) {
            const oauthArray: Array<any> = [];
            if (req.context.oauthService) {
                const { clientId, endpoint, scopes, iconUrl } = req.context.oauthService.oauth.seznam;
                oauthArray.push({
                    provider: 'seznam',
                    iconUrl,
                    authUrl: `${endpoint}?client_id=${clientId}&scope=${scopes.join('%20')}&response_type=code`,
                });
            }

            res.send({
                oauth: oauthArray,
            });
        },

        async create({ body, context, headers }: Request & HasContext, res) {
            const { formData } = body;

            if (formData.LOGIN) {
                (await context.userService.checkAndCreateCreditals(formData.LOGIN, headers["user-agent"] || ""))
                    .ifLeft((error) => {
                        logger.error(error)
                        res.status(401).send({ error })
                    })
                    .ifRight(({ doc, accessToken, refreshToken }) => {
                        res.send({
                            user: doc,
                            accessToken,
                            refreshToken,
                        });
                        eventEmitter.emit('user_login', doc);
                    });
            } else if (formData.AUTHORIZATION) {
                const oauthMaybe = await context.oauthService.requestAuthorization(
                    body.formData.AUTHORIZATION.code,
                    body.formData.AUTHORIZATION.redirectUri,
                    OAuthProvider.seznam
                )

                const oauthEither = oauthMaybe.toEither("unexpectedError")

                EitherAsync
                    .liftEither(oauthEither)
                    .chain((auth) =>
                        context.userService.refreshOauthAuthorization(
                            auth.email,
                            auth.email.replace(/@.*$/, '').replace(/\./g, ''),
                            {
                                accessToken: auth.access_token,
                                expiresIn: auth.expires_in,
                                refreshToken: auth.refresh_token,
                                tokenType: auth.token_type,
                                provider: OAuthProvider.seznam,
                            },
                            headers["user-agent"] || ""
                        )
                    ).ifRight(({ doc, accessToken, refreshToken, oldOauth }) => {
                        res.send({ user: doc, accessToken, refreshToken });
                        eventEmitter.emit('user_login', doc);

                        if (oldOauth)
                            context.oauthService.revokeToken(
                                oldOauth.accessToken,
                                oldOauth.refreshToken,
                                'refresh_token',
                                oldOauth.provider
                            );
                    }).ifLeft(() => res.sendStatus(500))
                    .run()
            } else res.sendStatus(400);
        },

        async deleteId({ user, params }: RequestWithAuth<{ id: string }>, res) {
            const refreshTokenId = params.id;

            const result = await UserModel.invalidateRefreshToken(user._id, refreshTokenId)
            if (result.nModified !== 1) return res.sendStatus(404)

            res.sendStatus(204)
        }
    });
