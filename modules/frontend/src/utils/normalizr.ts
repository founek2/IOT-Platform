import { IDevice } from 'common/models/interface/device';
import { normalize, schema } from 'normalizr';
import { Device } from '../store/slices/application/devicesSlice.js';
import { Thing } from '../store/slices/application/thingsSlice.js';

const thingEntity = new schema.Entity(
    'things',
    {},
    {
        idAttribute: '_id',
    }
);

const deviceEntity = new schema.Entity(
    'devices',
    {
        things: [thingEntity],
    },
    {
        idAttribute: '_id',
        processStrategy: (entity: IDevice, parent, key) => {
            return { ...entity, things: entity.things.map((thing) => ({ ...thing, deviceId: entity._id })) } as any;
            // return entity;
        },
    }
);

export function normalizeDevices(devices: IDevice[]) {
    return normalize(devices, [deviceEntity]);
}

export function normalizeDevice(device: IDevice) {
    const results = normalize(device, deviceEntity);
    const deviceId = results.result;
    const normalizedDevice: Device = results.entities.devices![deviceId];
    const things: { [key: string]: Thing } = results.entities.things!;

    return { device: normalizedDevice, things };
}
