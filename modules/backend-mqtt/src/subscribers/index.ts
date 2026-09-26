import { Emitter, EmitterEvents } from "../services/eventEmitter.js";
import { MqttService } from "../services/mqtt.js";
import device from "./device.js";

export default function (eventEmitter: Emitter<EmitterEvents>, mqttService: MqttService) {
	device(eventEmitter, mqttService);
}
