import { logger } from 'common/logger';
import { Context } from '../types/index.js';
import { UserModel } from 'common';
import { tokenAuthMiddleware } from 'common/middlewares/tokenAuthMiddleware';
import Router from '@koa/router';
import type Koa from "koa"

/**
 * URL prefix /authorization/signOut
 */

export default (): Router<Koa.DefaultState, Context> => {
    let api = new Router<Koa.DefaultState, Context>();

    api.post("/", tokenAuthMiddleware(), async (ctx) => {
        const result = await UserModel.invalidateRefreshToken(ctx.state.user._id, ctx.state.user.refreshTokenId);
        if (result.modifiedCount !== 1) return ctx.status = 404
        else ctx.status = 204;

        (await ctx.userService.getAuthorization(ctx.state.user._id))
            .ifJust(async (oauth) => {
                ctx.userService.removeAuthorization(ctx.state.user._id);

                const result = await ctx.oauthService.revokeToken(
                    oauth.accessToken,
                    oauth.refreshToken,
                    'refresh_token',
                    oauth.provider
                );
                result.ifNothing(() => {
                    logger.warning('signOut: Unable to revoke', oauth);
                });
            });
    })

    return api;
}