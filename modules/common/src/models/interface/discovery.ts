import { DeviceStatus } from './device.js';
import { ComponentType, IThingProperty, PropertyClass } from './thing.js';

export interface IDiscoveryThing {
    _id?: any;
    config: {
        name?: string;
        nodeId?: string;
        componentType?: ComponentType;
        propertyIds?: string[];
        properties: { [propertyId: string]: IThingProperty };
    };
    state?: {
        timeStamp: Date;
        value: any;
    };
}

export interface IDiscovery {
    _id?: any;
    deviceId: string;
    realm: string;
    name: string;
    nodeIds: string[];
    things: { [nodeId: string]: IDiscoveryThing };
    createdAt: Date;
    updatedAt: Date;
    state?: {
        status: {
            value: DeviceStatus;
            timestamp: Date;
        };
    };
    pairing: boolean;
}
