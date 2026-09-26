import { Next } from 'koa';
import mongoose from 'mongoose';
import { DiscoveryModel } from '../../models/deviceDiscoveryModel.js';
import { Permission } from '../../models/interface/userInterface.js';
import { HasState, KoaContext } from '../../types/index.js';
import { sendError } from '../../utils/sendError.js';

/**
 * Middleware to check if discovered device exists and user has permission to it
 * @param options - params[paramKey] -> IDiscovery["_id"]
 */
export function checkDiscoveryMiddleware<C extends KoaContext & HasState>(options: { paramKey: string } = { paramKey: 'id' }) {
    return async (ctx: C, next: Next) => {
        const discoveryId = ctx.params[options.paramKey];
        if (!mongoose.Types.ObjectId.isValid(discoveryId)) {
            return sendError(400, 'invalidParam', ctx);
        }

        if (!(await DiscoveryModel.checkExistsNotPairing(discoveryId))) {
            return sendError(404, 'InvalidDeviceId', ctx);
        }

        if (ctx.state.user?.admin) return next();

        if (
            ctx.state.user?.realm &&
            ctx.state.user.accessPermissions?.includes(Permission.write) &&
            (await DiscoveryModel.checkPermissions(discoveryId, ctx.state.user.realm))
        )
            return next();

        return sendError(403, 'invalidPermissions', ctx);
    };
}

