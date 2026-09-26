import { logger } from 'common/logger';
import { getProperty } from 'common/utils/getProperty';
import { getThing } from 'common/utils/getThing';
import { Emitter, EmitterEvents } from '../services/eventEmitter.js';
import { MqttService } from '../services/mqtt.js';

export default function (eventEmitter: Emitter<EmitterEvents>, mqttService: MqttService) {
    eventEmitter.on('device_pairing_init', async ({ apiKey, deviceId }) => {
        mqttService.publishStr(`prefix/${deviceId}/$config/apiKey/set`, apiKey);
    });

    eventEmitter.on('device_pairing_done', async (deviceId) => { });

    eventEmitter.on('device_set_state', ({ device, value, nodeId, propertyId }) => {
        logger.debug('state to change', value);
        const thing = getThing(device, nodeId);
        const property = getProperty(thing, propertyId);

        mqttService.publishStr(
            `v2/${device.metadata.realm}/${device.metadata.deviceId}/${nodeId}/${propertyId}/set`,
            String(value),
            { retain: Boolean(property.retained) }
        );
    });

    eventEmitter.on('device_send_command', ({ device, command }) => {
        logger.debug('command to send', command);

        mqttService.publishStr(`v2/${device.metadata.realm}/${device.metadata.deviceId}/$cmd/set`, command);
    });
}
