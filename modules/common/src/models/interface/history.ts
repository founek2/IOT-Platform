import { IDevice } from "./device.js";
import { IThing } from "./thing.js";

export interface HistoricalSensor {
    _id?: any;
    deviceId: IDevice["_id"];
    thingId: IThing["_id"];
    day: Date;
    first: Date;
    last: Date;
    properties: {
        [propertyId: string]: {
            propertyId: string;
            samples: [{ value: number; timestamp: Date }];
            sum: {
                day: number;
                night: number;
            };
            nsamples: {
                day: number;
                night: number;
            };
            min: number;
            max: number;
        };
    };
    nsamples: number;
}

export interface HistoricalGeneric {
    _id?: any;
    deviceId: IDevice["_id"];
    thingId: IThing["_id"];
    day: Date;
    first: Date;
    last: Date;
    properties: {
        [propertyId: string]: {
            propertyId: string;
            samples: [{ value: string; timestamp: Date }];
            nsamples: {
                day: number;
                night: number;
            };
        };
    };
    nsamples: number;
}
