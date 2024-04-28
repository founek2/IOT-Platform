import checkUser from './checkUserMiddleware';
import { HasState, KoaContext } from '../../types';
import { Permission } from '../../models/interface/userInterface';
import { Next } from 'koa';
import { sendError } from '../../utils/sendError';

/**
 * Middleware to check if user exists and initiator of request has permission to write
 */
export default function <C extends KoaContext & HasState>(options: { paramKey: string } = { paramKey: 'id' }) {
    return async (ctx: C, next: Next) => {
        return checkUser(options)(ctx, async () => {
            const { params, state } = ctx;
            const userId = params[options.paramKey];

            if (!state.user) {
                return sendError(403, 'missingUser', ctx);
            }

            if (state.user?.admin || (userId == state.user?._id && state.user?.accessPermissions?.includes(Permission.write)))
                return next();


            return sendError(403, 'InvalidPermissions', ctx);
        });
    };
}
