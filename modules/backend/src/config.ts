import { logger } from 'common';
import path from 'path';

function areWeTestingWithJest() {
    return process.env.JEST_WORKER_ID !== undefined;
}

function mustGetString(key: string, defaultValue?: string): string {
    const value = process.env[key];
    if (!value && !defaultValue) {
        logger.error(`Requred env ${key} missing`)
        throw new Error(`Requred env ${key} missing`)
    }

    return value ?? defaultValue as string;
}

const pathRef = path.join(__dirname, areWeTestingWithJest() ? '../../../.test.env' : '../../../.env');
const finalPath = process.env.ENV_CONFIG_PATH ? process.env.ENV_CONFIG_PATH : path.resolve(pathRef);
require('dotenv').config({
    path: finalPath,
});
logger.info(`loading .env from ${finalPath}, env=${process.env.NODE_ENV}`);

export const loadConfig = () => ({
    port: Number(process.env.PORT) || 8085,
    bodyLimit: mustGetString('BODY_LIMIT', '100kb'),
    homepage: mustGetString('HOME_PAGE'),
    portAuth: Number(process.env.AUTH_SERVICE_PORT) || 8084,
    serviceAuthUri: mustGetString('SERVICE_AUTH_URI', 'http://localhost:8084'),
    serviceMqttUri: mustGetString('SERVICE_MQTT_URI', 'http://localhost:8083'),
    dbUri: mustGetString('DATABASE_URI'),
    influxDb: {
        url: mustGetString('INFLUX_URL', 'http://localhost:8086'),
        apiKey: mustGetString('INFLUX_API_KEY'),
        organization: mustGetString('INFLUX_ORGANIZATION'),
        bucket: mustGetString('INFLUX_BUCKET'),
    },
    jwt: {
        privateKey: mustGetString('JWT_PRIVATE_KEY', '/keys/jwtRS256.key'),
        publicKey: mustGetString('JWT_PUBLIC_KEY', '/keys/jwtRS256.key.pub'),
        expiresIn: mustGetString('JWT_EXPIRES_IN', '14d'),
    },
    notification: {
        vapidPublicKey: mustGetString('VAPID_PUBLIC_KEY')
    },
    mqtt: {
        url: mustGetString('MQTT_URL'),
        managementPort: Number(process.env.MQTT_MANAGEMENT_PORT) || 15672,
    },
    email: process.env.EMAIL_HOST ? {
        host: process.env.EMAIL_HOST as string,
        port: Number(process.env.EMAIL_PORT) || 465,
        secure: true,
        userName: process.env.EMAIL_USERNAME as string,
        password: process.env.EMAIL_PASSWORD as string,
    } : undefined,
    agenda: {
        collection: 'agendaJobs',
        jobs: process.env.AGENDA_JOB_TYPES,
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
});

export type Config = ReturnType<typeof loadConfig>;
