import { UserModel } from 'common/models/userModel';
import { DiscoveryModel } from 'common/models/deviceDiscoveryModel';
import { DeviceModel } from 'common/models/deviceModel';
import { DeviceStatus } from 'common/models/interface/device';
import { ComponentType, PropertyClass, PropertyDataType } from 'common/models/interface/thing';
import { Server as serverIO } from 'socket.io';
import eventEmitter from '../eventEmitter.js';

type cbFn = (topic: string, message: any, groups: string[]) => void;
export default function (handle: (stringTemplate: string, fn: cbFn) => void, io: serverIO) {
    handle('prefix/+/$name', async function (topic, data, [deviceId]) {
        DiscoveryModel.updateOne({ deviceId }, { name: data.toString() }, { upsert: true }).exec();
    });

    handle('prefix/+/$realm', async function (topic, data, [deviceId]) {
        DiscoveryModel.updateOne({ deviceId }, { realm: data.toString() }, { upsert: true }).exec();
    });

    handle('prefix/+/$nodes', async function (topic, data, [deviceId]) {
        DiscoveryModel.updateOne({ deviceId }, { [`nodeIds`]: data.toString().split(',') }).exec();
    });

    handle('prefix/+/+/$name', async function (topic, data, [deviceId, nodeId]) {
        DiscoveryModel.updateOne({ deviceId }, { [`things.${nodeId}.config.name`]: data.toString() }).exec();
    });

    handle('prefix/+/+/$type', async function (topic, data, [deviceId, nodeId, propertyId]) {
        const componentType = data.toString();
        if (!(componentType in ComponentType)) return;

        DiscoveryModel.updateOne({ deviceId }, { [`things.${nodeId}.config.componentType`]: componentType }).exec();
    });

    handle('prefix/+/+/$properties', async function (topic, data, [deviceId, nodeId]) {
        DiscoveryModel.updateOne(
            { deviceId },
            { [`things.${nodeId}.config.propertyIds`]: data.toString().split(',') }
        ).exec();
    });

    handle('prefix/+/+/+/$name', async function (topic, data, [deviceId, nodeId, propertyId]) {
        DiscoveryModel.updateOne(
            { deviceId },
            { [`things.${nodeId}.config.properties.${propertyId}.name`]: data.toString() }
        ).exec();
    });

    handle('prefix/+/+/+/$class', async function (topic, data, [deviceId, nodeId, propertyId]) {
        const propertyClass = data.toString();
        if (!(propertyClass in PropertyClass)) return;

        DiscoveryModel.updateOne(
            { deviceId },
            { [`things.${nodeId}.config.properties.${propertyId}.propertyClass`]: propertyClass }
        ).exec();
    });

    handle('prefix/+/+/+/$datatype', async function (topic, data, [deviceId, nodeId, propertyId]) {
        const dataType = data.toString();
        if (!(dataType in PropertyDataType)) return;

        DiscoveryModel.updateOne(
            { deviceId },
            { [`things.${nodeId}.config.properties.${propertyId}.dataType`]: dataType }
        ).exec();
    });

    handle('prefix/+/+/+/$unit', async function (topic, data, [deviceId, nodeId, propertyId]) {
        DiscoveryModel.updateOne(
            { deviceId },
            { [`things.${nodeId}.config.properties.${propertyId}.unitOfMeasurement`]: data.toString() }
        ).exec();
    });

    handle('prefix/+/+/+/$format', async function (topic, data, [deviceId, nodeId, propertyId]) {
        DiscoveryModel.updateOne(
            { deviceId },
            { [`things.${nodeId}.config.properties.${propertyId}.format`]: data.toString() }
        ).exec();
    });

    handle('prefix/+/+/+/$settable', async function (topic, data, [deviceId, nodeId, propertyId]) {
        const settable = data.toString();
        if (!(settable === 'true' || settable === 'false')) return;

        DiscoveryModel.updateOne(
            { deviceId },
            { [`things.${nodeId}.config.properties.${propertyId}.settable`]: settable }
        ).exec();
    });

    handle('prefix/+/+/+/$retained', async function (topic, data, [deviceId, nodeId, propertyId]) {
        const retained = data.toString();
        if (!(retained === 'true' || retained === 'false')) return;

        DiscoveryModel.updateOne(
            { deviceId },
            { [`things.${nodeId}.config.properties.${propertyId}.retained`]: retained }
        ).exec();
    });

    handle('prefix/+/$state', async function (topic, data, [deviceId]) {
        const status: DeviceStatus = data.toString();
        if (!(status in DeviceStatus)) return;

        if (status === DeviceStatus.paired) {
            return DiscoveryModel.deleteOne({ deviceId, pairing: true }).exec();
        }

        if (status === DeviceStatus.ready) {
            const doc = await DiscoveryModel.findOne({ deviceId, pairing: true }).exec();
            // if device is already in pairing process, then send it apiKey
            if (doc) {
                const device = await DeviceModel.findOne({
                    'metadata.deviceId': deviceId,
                    'metadata.topicPrefix': doc?.realm,
                });
                if (device) return eventEmitter.emit('device_pairing_init', { deviceId, apiKey: device.apiKey });
                else DiscoveryModel.updateOne({ deviceId }, { pairing: false }).exec(); // if user deleted his device, but wasnt paired yet
            }
        }

        const doc = await DiscoveryModel.findOneAndUpdate(
            { deviceId },
            { 'state.status.value': status, 'state.status.timestamp': new Date() },
            {
                upsert: status !== DeviceStatus.disconnected,
                setDefaultsOnInsert: true,
                new: true,
            }
        )
            .lean()
            .exec();

        const user = await UserModel.findOne({ realm: doc?.realm }).select('_id').lean();
        // notify user about newly discovered device
        if (user?._id && !doc?.pairing) io.to(user._id.toString()).emit('deviceDiscovered', doc);
    });
}
