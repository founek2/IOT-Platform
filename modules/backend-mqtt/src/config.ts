import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { logger } from 'common/logger';

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));

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

const pathRef = path.join(moduleDirectory, areWeTestingWithJest() ? '../../../.test.env' : '../../../.env');
const finalPath = process.env.ENV_CONFIG_PATH ? process.env.ENV_CONFIG_PATH : path.resolve(pathRef);
dotenv.config({
    path: finalPath,
});
logger.info(`loading .env from ${finalPath}, env=${process.env.NODE_ENV}`);

export const loadConfig = () => ({
    homepage: mustGetString('HOME_PAGE'),
    portMqtt: Number(process.env.MQTT_SERVICE_PORT) || 8083,
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
        vapidPrivateKey: mustGetString('VAPID_PRIVATE_KEY'),
        vapidPublicKey: mustGetString('VAPID_PUBLIC_KEY'),
        vapidEmail: mustGetString('VAPID_MAILTO'),
    },
    mqtt: {
        url: mustGetString('MQTT_URL'),
        port: Number(process.env.MQTT_PORT) || 8883,
        // Only optional for local testing
        userName: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
    },
});

export type Config = ReturnType<typeof loadConfig>;
