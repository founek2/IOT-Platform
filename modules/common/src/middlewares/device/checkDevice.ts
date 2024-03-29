import { DeviceModel } from '../../models/deviceModel';
import express from 'express';
import mongoose from 'mongoose';

/**
 * Middleware to check if device exists
 * @param options - params[paramKey] -> IDevice["_id"]
 */
export default function ({ paramKey = "id", type }: { paramKey?: string, type?: "metadata" } = { paramKey: "id" }) {
    return async ({ params }: any, res: express.Response, next: express.NextFunction) => {
        const deviceId = params[paramKey];

        if (type === "metadata") {
            if (!(await DeviceModel.checkExistsByMetadata(deviceId))) return res.status(404).send({ error: 'deviceNotExits' });
        } else {
            if (!mongoose.Types.ObjectId.isValid(deviceId)) return res.status(400).send({ error: 'InvalidParam' });

            if (!(await DeviceModel.checkExists(deviceId))) return res.status(404).send({ error: 'deviceNotExits' });
        }

        next();
    };
}
