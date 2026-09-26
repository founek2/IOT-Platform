import { Next } from 'koa';
import { DeviceModel } from '../../models/deviceModel.js';
import { Permission } from '../../models/interface/userInterface.js';
import { HasState, KoaContext } from '../../types/index.js';
import { sendError } from '../../utils/sendError.js';
import checkDeviceMiddleware from './checkDeviceMiddleware.js';

/**
 * Middleware to check if device exists and user has permission to control it
 */
export function checkRealmReadPermissionMiddleware<C extends KoaContext & HasState>(options: { paramKey: string } = { paramKey: 'id' }) {
    return async (ctx: C, next: Next) => {
        return checkDeviceMiddleware({ ...options, type: "metadata" })(ctx, async () => {
            const user = ctx.state.user;
            const realm = ctx.params['realm'];
            const deviceId = ctx.params[options.paramKey];
            if (!realm || !deviceId) throw new Error('Missing realm or deviceId parameters');

            if (!user) return sendError(403, 'missingUser', ctx);

            if (user.admin) return next();

            if (
                user.accessPermissions?.includes(Permission.read) &&
                (await DeviceModel.checkRealmReadPerm({ realm, deviceId }, user._id))
            )
                return next();

            sendError(403, 'invalidPermissions', ctx);
        });
    };
}
