import { Maybe } from "purify-ts";
import { TypedEmitter } from "../emitter/typedEmitter.js";
import { DeviceCommand, IDevice } from "../models/interface/device.js";
import { IThing, IThingProperty } from "../models/interface/thing.js";

export type Pass = {
    password: string;
    userName: string;
    validTo: Date;
};

export interface Events {
    "new_pass": Maybe<Pass>,
    "request_pass": undefined,
    "pairing_new_device": IDevice,
    "device_set_property_value": { device: IDevice, nodeId: IThing['config']['nodeId'], propertyId: IThingProperty['propertyId'], value: string | number | boolean },
    "device_send_command": { device: IDevice, command: DeviceCommand }
}

export class BusEmitter extends TypedEmitter<Events> { }

export type BusEmitterType = TypedEmitter<Events>

