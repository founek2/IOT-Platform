import { ControlRecipe } from '@common/types';
import type { Request } from 'express';
import { IUser, Permission } from '@common/models/interface/userInterface';

export interface EmitterEvents {
    user_login: IUser;
    user_signup: UserBasic;
    user_forgot: { email: IUser['info']['email'] };
    device_control_recipe_change: { recipes: ControlRecipe[]; deviceId: string };
    device_delete: string;
    device_create: string;
    devices_delete: string[];
}

export interface UserBasic {
    id: string;
    info: {
        firstName?: string;
        email: string;
        lastName?: string;
        userName: string;
    };
}

export interface Config {
    port: number;
    bodyLimit: string;
    homepage: string;
    portAuth: number;
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

export type RequestWithAuthOpt = Request & {
    user?: IUser & { admin?: boolean; accessPermissions?: Permission[] };
    root?: boolean;
};

export type RequestWithAuth = Request & {
    user: IUser & { admin?: boolean; accessPermissions?: Permission[] };
    root?: boolean;
};
