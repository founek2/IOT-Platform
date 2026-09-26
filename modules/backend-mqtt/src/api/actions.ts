import eventEmitter from '../services/eventEmitter.js';
import { BusEmitterType } from "common/interfaces/asyncEmitter"

// const router = express.Router();

// /**
//  * URL prefix /actions
//  */

// /* Send apiKey to device */
// router.put('/device/:deviceId/pairing/init', function (req, res) {
//     const deviceId = req.params.deviceId;
//     const apiKey = req.body.apiKey;
//     logger.debug('ACTIONS body', req.body);
//     eventEmitter.emit('device_pairing_init', { deviceId, apiKey });
//     res.sendStatus(204);
// });

// /* Send state change of property to device */
// router.patch('/device/:deviceId/thing/:nodeId/property/:propertyId', async function (req, res) {
//     const { deviceId, nodeId, propertyId } = req.params;
//     const body = req.body as { device: IDevice; value: string | number };

//     eventEmitter.emit('device_set_state', { device: body.device, nodeId, propertyId, value: body.value });
//     res.sendStatus(204);
// });

// /* Send command to device */
// router.post('/device/:deviceId', async function (req, res) {
//     const { deviceId } = req.params;

//     eventEmitter.emit('device_send_command', { device: req.body.device, command: req.body.command });
//     res.sendStatus(204);
// });

export default function ({ bus }: { bus: BusEmitterType }) {
    bus.on("pairing_new_device", (device) => {
        const deviceId = device.metadata.deviceId;
        const apiKey = device.apiKey;
        eventEmitter.emit('device_pairing_init', { deviceId, apiKey });
    })

    bus.on("device_set_property_value", ({ device, nodeId, propertyId, value }) => {
        eventEmitter.emit('device_set_state', { device: device, nodeId, propertyId, value });
    })

    bus.on("device_send_command", ({ device, command }) => {
        eventEmitter.emit('device_send_command', { device, command });
    })
};
