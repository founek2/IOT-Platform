import { CONTROL_TYPES } from '../constants/index.js';
import { IDevice } from '../models/interface/device.js';
import { IThing, PropertyState } from '../models/interface/thing.js';
import { IUser, Permission } from '../models/interface/userInterface.js';
import { JwtService } from '../services/jwtService.js';
import { UserService } from '../services/userService.js';
import { Context, Request as RequestKoa } from 'koa';

export interface Config {
    port: number;
    bodyLimit: string;
    homepage: string;
    portAuth: number;
    portMqtt: number;
    serviceMqttUri: string;
    serviceAuthUri: string;
    dbUri: string;
    influxDb: {
        url: string;
        apiKey: string;
        organization: string;
        bucket: string;
    };
    jwt: {
        privateKey: string;
        publicKey: string;
        expiresIn: string;
    };
    notification: {
        vapidPrivateKey: string
        vapidPublicKey: string
    }
    email?: {
        host: string;
        port: number;
        secure: boolean;
        userName: string;
        password: string;
    };
    agenda: {
        collection: string;
        jobs?: string;
    };
    mqtt: {
        url: string;
        port: number;
        managementPort: number;
    };
    oauth: {
        seznam: {
            clientSecret?: string;
            clientId?: string;
            iconUrl: string;
            endpoint: string;
            scopes: string[];
        };
    };
}

export type FormType<T> = { JSONkey: string } & T;
export type ControlState = { state: any; updatedAt: string } | null;
export type ControlRecipe = {
    name: string;
    type: CONTROL_TYPES;
    JSONkey: string;
    description?: string | null;
    ipAddress?: string;
    metadata?: { [key: string]: any };
};
export type StateUpdate = any;

export type ChangeHandler<T = any> = (
    form: FormType<T>,
    currentState: ControlState,
    recipe: ControlRecipe
) => Promise<StateUpdate>;

export type AckHandler = (recipe: ControlRecipe) => Promise<boolean>;

export type SocketUpdateThingState = {
    _id: IDevice['_id'];
    thing: {
        _id: IThing['_id'];
        nodeId: IThing['config']['nodeId'];
        state: { [propertyId: string]: PropertyState };
    };
};

export type Measurement = {
    _table: number;
    _field: 'value_float' | 'value_int' | 'value_bool' | 'value_string';
    _value: number | boolean | string;
    _start: Date;
    _stop: Date;
    _time: Date;
    deviceId: string;
    deviceName: string;
    propertyId: string;
    thingId: string;
};

export type MeasurementNumber = Measurement & {
    _field: 'value_float' | 'value_int';
    _value: number;
};

export type MeasurementBool = Measurement & {
    _field: 'value_bool' | 'value_int';
    _value: boolean;
};

export type MeasurementString = Measurement & {
    _field: 'value_string';
    _value: string;
};

export type HasContext = {
    context: {
        jwtService: JwtService
        userService: UserService
    }
}

export type KoaHasContext = {
    jwtService: JwtService
    userService: UserService
}
export type HasState = {
    state: {
        user: Pick<IUser, "_id" | "groups" | "realm"> & { admin?: boolean; accessPermissions?: Permission[], refreshTokenId?: string };
        root?: boolean;
    }
}

interface KoaRequest<RequestBody = any> extends RequestKoa {
    body?: RequestBody;
}

export interface KoaContext<RequestBody = any, ResponseBody = any> extends Context {
    request: KoaRequest<RequestBody>;
    body: ResponseBody;
}

export interface KoaResponseContext<ResponseBody> extends KoaContext<any, ResponseBody> { }