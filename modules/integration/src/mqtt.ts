import mqtt, { type MqttClient } from 'mqtt';
import { logger } from 'common/logger';

export default function connect(brokerUrl: string, config: mqtt.IClientOptions) {
    logger.debug(`Connecting to MQTT host=${brokerUrl}:${config.port} username=${config.username}`);
    const client = mqtt.connect(brokerUrl, config);

    client.setMaxListeners(15) // Currently every property subscribers to mqtt messages, so default limit 10 is not enough

    applyLogging(client)

    return client;
}

function applyLogging(cl: MqttClient) {
    cl.on('message', function (topic) {
        logger.debug(topic);
    });

    cl.on('offline', function () {
        logger.silly('mqtt offline');
    });

    cl.on('error', function (err) {
        logger.silly('mqtt error', err.name);
    });
}