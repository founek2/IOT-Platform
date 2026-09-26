import { UserModel } from '../../models/userModel.js';
import mongoose from 'mongoose';
import { logger } from '../../logger/index.js';
import { KoaContext } from '../../types/index.js';
import { Next } from 'koa';
import { sendError } from '../../utils/sendError.js';

/**
 * Middleware to check if user exists
 * @param options - params[paramKey] -> IUser["_id"]
 */
export default function <C extends KoaContext>(options: { paramKey: string } = { paramKey: 'id' }) {
    return async (ctx: C, next: Next) => {
        const userId = ctx.params[options.paramKey];
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            logger.warning("Malformed userId", userId, options.paramKey, ctx.params)
            return sendError(400, 'invalidParam', ctx);
        };

        if (!(await UserModel.checkExists(userId)))
            return sendError(400, 'userNotExist', ctx);


        return next();
    };
}
