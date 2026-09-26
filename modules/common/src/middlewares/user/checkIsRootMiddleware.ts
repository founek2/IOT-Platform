import { Next } from 'koa';
import { HasState, KoaContext } from '../../types/index.js';
import { isRoot } from '../../utils/groups.js';
import { sendError } from '../../utils/sendError.js';

export function checkIsRootMiddleware<C extends KoaContext & HasState>() {
    return async (ctx: C, next: Next) => {
        const { user } = ctx.state;
        return user && isRoot(user.groups) ? next() : sendError(403, 'InvalidPermissions', ctx);
    };
}
