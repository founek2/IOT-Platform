import { Next } from 'koa';
import { DeviceModel } from '../../models/deviceModel.js';
import { Permission } from '../../models/interface/userInterface.js';
import { HasState, KoaContext } from '../../types/index.js';
import { sendError } from '../../utils/sendError.js';
import checkDeviceMiddleware from './checkDeviceMiddleware.js';

/**
 * Middleware to check if device exists and user has permission to read it
 * @param options - params[paramKey] -> IDevice["_id"]
 */
export function writeDevicePermissionMiddleware<C extends KoaContext & HasState>(options: { paramKey: string } = { paramKey: 'id' }) {
    return async (ctx: C, next: Next) => {
        return checkDeviceMiddleware(options)(ctx, async () => {
            const deviceId = ctx.params[options.paramKey];
            if (!ctx.state.user)
                return sendError(403, 'missingUser', ctx)

            if (ctx.state.user.admin) return next();

            if (
                ctx.state.user.accessPermissions?.includes(Permission.read) &&
                (await DeviceModel.checkWritePerm(deviceId, ctx.state.user._id))
            )
                return next();

            return sendError(403, 'invalidPermissions', ctx)
        });
    };
}
