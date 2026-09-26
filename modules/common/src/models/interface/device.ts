import { IThing } from "./thing.js";

export enum DeviceCommand {
    restart = "restart",
    reset = "reset",
}

export enum DeviceStatus {
    disconnected = "disconnected",
    lost = "lost",
    error = "error",
    alert = "alert",
    sleeping = "sleeping",
    restarting = "restarting",
    ready = "ready",
    init = "init",
    paired = "paired",
}

export type IDeviceStatus =
    | {
        value: DeviceStatus;
        timestamp: Date;
    }
    | undefined;

export interface IDevice {
    _id?: any;
    info: {
        name: string;
        description?: string;
        imgPath?: string;
        location: {
            building: string;
            room: string;
        };
    };
    permissions: {
        read: string[];
        write: string[];
        control: string[];
    };
    things: IThing[];
    state?: {
        status: IDeviceStatus;
        lastAck?: Date;
    };
    apiKey: string;
    metadata: {
        realm: string;
        deviceId: string;
        publicRead?: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}
