import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { logger } from 'common/logger';

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));

function mustGetString(key: string, defaultValue?: string): string {
    const value = process.env[key];
    if (!value && !defaultValue) {
        logger.error(`Requred env ${key} missing`)
        throw new Error(`Requred env ${key} missing`)
    }

    return value ?? defaultValue as string;
}


export const loadConfig = (pathToDotEnvFile?: string) => {
    if (!pathToDotEnvFile) {
        pathToDotEnvFile = path.join(moduleDirectory, '../../../.env');
    }
    const finalPath = process.env.ENV_CONFIG_PATH ? process.env.ENV_CONFIG_PATH : path.resolve(pathToDotEnvFile);
    dotenv.config({
        path: finalPath,
    });
    logger.info(`loading .env from ${finalPath}, env=${process.env.NODE_ENV}`);

    return {
        portAuth: Number(process.env.AUTH_SERVICE_PORT) || 8084,
        dbUri: mustGetString('DATABASE_URI'),
        mqtt: {
            // Only optional for local testing
            userName: process.env.MQTT_USERNAME,
            password: process.env.MQTT_PASSWORD,
        },
        jwt: {
            privateKey: mustGetString('JWT_PRIVATE_KEY', '/keys/jwtRS256.key'),
            publicKey: mustGetString('JWT_PUBLIC_KEY', '/keys/jwtRS256.key.pub'),
            expiresIn: mustGetString('JWT_EXPIRES_IN', '14d'),
        },
        oauth: {
            seznam: {
                clientSecret: process.env.OAUTH_SEZNAM_CLIENT_SECRET as string,
                clientId: process.env.OAUTH_SEZNAM_CLIENT_ID as string,
                iconUrl: '/assets/images/seznamLogo.svg',
                endpoint: 'https://login.szn.cz/api/v1/oauth/auth',
                scopes: ['identity'],
            },
        },
    }
};

export type Config = ReturnType<typeof loadConfig>;
