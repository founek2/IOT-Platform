import config from 'common/src/config';
import fieldDescriptors from 'common/src/fieldDescriptors';
import { OAuthProvider } from 'common/src/models/interface/userInterface';
import { UserService } from 'common/src/services/userService';
import { EitherAsync } from 'purify-ts/EitherAsync';
import { MaybeAsync } from 'purify-ts/MaybeAsync';
import formDataChecker from 'common/src/middlewares/formDataChecker';
import { rateLimiterMiddleware } from 'common/src/middlewares/rateLimiter';
import resource from 'common/src/middlewares/resource-router-middleware';
import eventEmitter from '../services/eventEmitter';
import { OAuthService } from '../services/oauthService';

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
        },

        async index(req, res) {
            const oauthArray: Array<any> = [];
            if (config.oauth.seznam.clientId) {
                const { clientId, endpoint, scopes, iconUrl } = config.oauth.seznam;
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

        async create({ body, user }: any, res) {
            const { formData } = body;

            if (formData.LOGIN) {
                const processLogin = EitherAsync(async ({ fromPromise }) => {
                    return await fromPromise(UserService.checkCreditals(formData.LOGIN));
                });

                (await processLogin.run())
                    .ifLeft((error) => res.status(401).send({ error }))
                    .ifRight(({ doc, token }) => {
                        res.send({ user: doc, token });
                        eventEmitter.emit('user_login', doc);
                    });
            } else if (formData.AUTHORIZATION) {
                const processAuth = MaybeAsync(async ({ fromPromise, liftMaybe }) => {
                    const auth = await fromPromise(
                        OAuthService.requestAuthorization(
                            body.formData.AUTHORIZATION.code,
                            body.formData.AUTHORIZATION.redirectUri,
                            OAuthProvider.seznam
                        )
                    );

                    return await fromPromise(
                        UserService.refreshAuthorization(
                            auth.email,
                            auth.email.replace(/@.*$/, '').replace(/\./g, ''),
                            {
                                accessToken: auth.access_token,
                                expiresIn: auth.expires_in,
                                refreshToken: auth.refresh_token,
                                tokenType: auth.token_type,
                                provider: OAuthProvider.seznam,
                            }
                        )
                    );
                });

                (await processAuth.run())
                    .ifJust(({ doc, token, oldOauth }) => {
                        res.send({ user: doc, token });
                        eventEmitter.emit('user_login', doc);
                        if (oldOauth)
                            OAuthService.revokeToken(
                                oldOauth.accessToken,
                                oldOauth.refreshToken,
                                'refresh_token',
                                oldOauth.provider
                            );
                    })
                    .ifNothing(() => res.sendStatus(500));
            } else res.sendStatus(400);
        },
    });