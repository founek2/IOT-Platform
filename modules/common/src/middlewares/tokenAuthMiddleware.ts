import { not } from 'ramda';
import { logger } from '../logger/index.js';
import { Permission } from '../models/interface/userInterface.js';
import { HasState, KoaContext, KoaHasContext } from '../types/index.js';
import { Next } from 'koa';
import { sendError } from '../utils/sendError.js';

type Options = {
    restricted?: boolean;
    methods?: Array<'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'>;
};
/**
 * Middleware validating JWT token in headers and binding User object to request
 */
export function tokenAuthMiddleware<C extends KoaContext>(
    options: Options = {
        restricted: true,
    }
) {
    return async (ctx: C & Partial<KoaHasContext> & HasState, next: Next) => {
        const { restricted, methods } = options;
        // if (req.url !== '/login') {
        if (not(methods === undefined || methods.some((method) => method === ctx.req.method))) return next();

        const [type, jwtToken] = (ctx.get('Authorization') || '').split(' ');
        const apiKey = ctx.query.api_key || ctx.get('X-API-Key');

        if (!ctx?.jwtService) {
            throw Error("Missing jwtService in context")
        }
        const jwtService = ctx.jwtService;

        if (!ctx?.userService) {
            throw Error("Missing jwtService in context")
        }
        const userService = ctx.userService

        if (jwtToken) {
            try {
                const payload = (await jwtService.verify(jwtToken)).unsafeCoerce();

                logger.debug(`Verified user=${payload.sub}, groups=${payload.groups.join(',')}`);
                ctx.state.user = {
                    _id: payload.sub,
                    groups: payload.groups,
                    accessPermissions: [Permission.write, Permission.read, Permission.control],
                    realm: payload.realm,
                    admin: payload.groups.some((v) => v === 'admin'),
                    refreshTokenId: payload.iss
                }

                return next();
            } catch (err) {
                logger.error('token problem', err);
                return sendError(400, 'invalidToken', ctx);
            }
        } else if (typeof apiKey === "string") {
            const validationResult = await userService.validateAccessToken(apiKey);

            if (validationResult.isRight()) {
                const [user, { permissions }] = validationResult.unsafeCoerce()

                ctx.state.user = user;
                ctx.state.user.accessPermissions = permissions;

                return next();
            } else {
                return sendError(400, 'invalidToken', ctx);
            }
        } else if (!restricted) {
            return next();
        } else {
            return sendError(400, 'tokenNotProvided', ctx);
        }
    };
}

