import { DeviceModel } from '../../models/deviceModel';
import express from 'express';
import checkDevice from './checkDevice';
import { RequestWithAuthOpt } from '../../types';
import { Permission } from '../../models/interface/userInterface';

/**
 * Middleware to check if device exists and user has permission to write it
 * @param options - params[paramKey] -> IDevice["_id"]
 */
export default function (options: { paramKey: string } = { paramKey: 'id' }) {
    return async (req: RequestWithAuthOpt, res: express.Response, next: express.NextFunction) => {
        checkDevice(options)(req, res, async () => {
            const { params, user } = req;
            const deviceId = params[options.paramKey];
            if (!user) return res.status(403).send({ error: 'missingUser' });

            if (user.admin) return next();

            if (
                user.accessPermissions?.includes(Permission.write) &&
                (await DeviceModel.checkWritePerm(deviceId, user._id))
            )
                return next();

            return res.status(403).send({ error: 'invalidPermissions' });
        });
    };
}
