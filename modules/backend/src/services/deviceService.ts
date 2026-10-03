import mongoose from 'mongoose';
import { IDevice } from 'common/models/interface/device';
import { DeviceModel } from 'common/models/deviceModel';
import { NotifyModel } from 'common/models/notifyModel';

/**
 * Service for managing device
 */
export class DeviceService {
    /**
     * Delete provided device
     * @param {IDevice['_id']} deviceId
     */
    public static async deleteById(deviceId: IDevice['_id']): Promise<boolean> {
        const res = await DeviceModel.deleteOne({
            _id: new mongoose.Types.ObjectId(deviceId),
        });

        if (res.deletedCount !== 1) return false;

        // TODO delete data from influx

        await NotifyModel.deleteMany({
            deviceId: new mongoose.Types.ObjectId(deviceId),
        });

        return true;
    }
}
