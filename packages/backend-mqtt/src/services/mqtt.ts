import mqtt, { MqttClient } from "mqtt";
// import { getConfig } from './config'
import { map, flip, keys, all, equals, contains, toPairs, uniq } from "ramda";
import * as FireBaseService from "./FireBase";
import { DiscoveryModel } from "common/lib/models/deviceDiscoveryModel";
import { Server as serverIO } from "socket.io";
import EventEmitter from "events";
import { DeviceModel } from "common/lib/models/deviceModel";
import { HistoricalModel } from "common/lib/models/historyModel";
import eventEmitter from "./eventEmitter";
import { IDevice, DeviceStatus } from "common/lib/models/interface/device";
import { SocketThingState } from "common/lib/types";
import { ComponentType, IThing, IThingProperty, PropertyDataType } from "common/lib/models/interface/thing";
import handlePrefix from "./mqtt/prefix";
import { Config } from "../types";
import { getThing } from "../utils/getThing";
import { getProperty } from "../utils/getProperty";
import { validateValue } from "common/lib/utils/validateValue";
import { devLog } from "framework-ui/lib/logger";

const emitter = new EventEmitter();

let mqttClient: mqtt.MqttClient | undefined;

type qosType = { qos: 0 | 2 | 1 | undefined };
export function publishStr(topic: string, message: string, opt: qosType = { qos: 2 }) {
	if (!mqttClient) throw new Error("client was not inicialized");

	return mqttClient.publish(topic, message, { qos: opt.qos });
}

export function publish(topic: string, message: string, opt: qosType = { qos: 2 }) {
	if (!mqttClient) throw new Error("client was not inicialized");

	return mqttClient.publish(topic, message, { qos: opt.qos });
}

type cbFn = (topic: string, message: any, groups: string[]) => void;
function topicParser(topic: string, message: any) {
	return (stringTemplate: string, fn: cbFn) => {
		const regex = new RegExp(stringTemplate.replace("$", "\\$").replace(/\+/g, "([^/\\$]+)"));
		const match = topic.match(regex) as any;
		//console.log("matching topic=" + topic, "by regex=" + regex, "result=" + match);
		if (!match) return;

		const [wholeMatch, ...groups] = match;
		fn(topic, message, groups || []);
	};
}

export function subscribeDeviceState(deviceId: string, cb: (status: string) => void) {
	emitter.on("device_" + deviceId, cb);
}

const magicRegex = /^(?:\/([\w]*)([/]\w+[/]\w+[/]\w+)(.*))/;
export default (io: serverIO, config: Config): MqttClient => {
	console.log("connecting to mqtt");
	const client = mqtt.connect(config.mqtt.url, {
		username: `${config.mqtt.userName}`,
		password: `${config.mqtt.password}`,
		port: config.mqtt.port,
		connectTimeout: 20 * 1000,
		rejectUnauthorized: false,
	});
	mqttClient = client;

	client.on("connect", function () {
		client.subscribe("#", async function (err, granted) {
			if (err) console.log("problem:", err);
		});
	});

	client.on("message", async function (topic, message) {
		const handle = topicParser(topic, message);
		console.log(topic);

		handlePrefix(handle, io);

		handle("v2/+/+/$state", async function (topic, data, [realm, deviceId]) {
			const message: DeviceStatus = data.toString();
			console.log("got", message, realm, deviceId);
			const device = await DeviceModel.findOneAndUpdate(
				{
					"metadata.deviceId": deviceId,
					"metadata.realm": realm,
				},
				{
					"state.status.value": message,
					"state.status.timestamp": new Date(),
				},
				{ new: true }
			)
				.lean()
				.exec();

			if (device)
				uniq(Object.values(device.permissions).flat().map(String)).forEach((userId) =>
					io.to(userId).emit("device", {
						_id: device._id,
						state: {
							status: device.state!.status,
						},
					})
				);
		});

		handle("v2/+/+/+/+", async function (topic, message, [realm, deviceId, nodeId, propertyId]) {
			const timestamp = new Date();

			const device = await DeviceModel.findOne({
				"metadata.deviceId": deviceId,
				"metadata.realm": realm,
				"things.config.nodeId": nodeId,
				"things.config.properties.propertyId": propertyId,
			})
				.lean()
				.exec();
			if (!device) return devLog("mqtt - Got data from invalid/misconfigured device");

			const thing = getThing(device, nodeId);
			const property = getProperty(thing, propertyId);
			const result = validateValue(property, message.toString());
			if (!result.valid) return devLog("mqtt - Got invalid data");

			DeviceModel.updateOne(
				{
					_id: device._id,
					"things.config.nodeId": nodeId,
				},
				{
					$set: {
						"things.$.state.timestamp": timestamp,
						[`things.$.state.value.${propertyId}`]: result.value,
					},
				}
			).exec();

			console.log("saving data");

			sendToUsers(io, device, nodeId, propertyId, result.value);

			HistoricalModel.saveData(device._id, thing._id, propertyId, result.value, timestamp);
			FireBaseService.processData(device, nodeId, propertyId, result.value);
		});
	});

	client.on("error", function (err) {
		console.log("mqtt connection error");
		// client.reconnect()
	});

	return client;
};

function sendToUsers(io: serverIO, device: IDevice, nodeId: string, propertyId: string, newValue: string | number) {
	let thing = getThing(device, nodeId);
	if (thing.state) thing.state.value[propertyId] = newValue;
	else thing.state = { timestamp: new Date(), value: { [propertyId]: newValue } };

	const updateData: SocketThingState = {
		_id: device._id,
		thing: {
			_id: thing._id,
			state: thing.state,
		},
	};
	device.permissions["read"].forEach((userId) => {
		io.to(userId.toString()).emit("control", updateData);
	});
}
