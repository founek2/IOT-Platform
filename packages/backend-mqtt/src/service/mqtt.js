import mqtt from 'mqtt';
// import { getConfig } from './config'
import config from '../config';
import Device from 'backend/dist/models/Device';
import { map, flip, keys, all, equals, contains, toPairs, _ } from 'ramda';
import { processSensorsData, processControlData } from './FireBase';

let mqttClient = null;

export function publish(topic, message, opt = { qos: 2 }) {
	if (!mqttClient) throw new Error('client was not inicialized');
	return mqttClient.publish(topic, JSON.stringify(message), opt);
}

/* ts */
const magicRegex = /^(?:\/([\w]*)([/]\w+[/]\w+[/]\w+)(.*))/;
export default (io) => {
	console.log('connecting to mqtt');
	const client = mqtt.connect('mqtts://localhost', {
		username: `${config.mqtt.userName}`,
		password: `${config.mqtt.password}`,
		port: config.mqtt.port,
		connectTimeout: 20 * 1000,
		rejectUnauthorized: false
	});
	mqttClient = client;

	client.on('connect', function() {
		client.subscribe('#', function(err) {
			if (!err) {
				console.log('subscribed to #');
			} else console.log('mqtt error:', err);
		});
	});

	client.on('message', async function(topic, message) {
		try {
			const [ , ownerId, deviceTopic, restTopic ] = topic.match(magicRegex);
			if (!ownerId || !deviceTopic) return;
			console.log('restTopic', restTopic);

			if (restTopic === '' || restTopic === '/') {
				const data = JSON.parse(message.toString());
				const updateTime = new Date();
				const {
					_id: deviceID,
					publicRead,
					permissions: { read = [] },
					sensors,
					info
				} = await Device.updateSensorsData(ownerId, deviceTopic, data, updateTime);
				const emitData = { deviceID, data, updatedAt: updateTime };

				if (publicRead)
					io.to('public').emit('sensors', emitData); // send to all users with permissions
				else
					read.forEach((id) => {
						io.to(id.toString()).emit('sensors', emitData);
					});

				console.log('emmiting to public', publicRead);

				processSensorsData({ _id: deviceID, sensors, info }, data);
			} else if (restTopic === '/initControl') {
				const data = JSON.parse(message.toString());
				const dev = await Device.findOne({ createdBy: ownerId, topic: deviceTopic }, 'control.recipe');
				const jsonKeys = dev.control.recipe.map((obj) => obj.JSONkey);
				const result = map(flip(contains)(jsonKeys), keys(data));

				if (all(equals(true), result)) {
					const updateTime = new Date();
					const { permissions: { control = [] }, control: controlObj, info, _id } = await Device.initControl(
						ownerId,
						deviceTopic,
						data,
						updateTime
					);
					console.log('init control', data);

					let newData = {};
					toPairs(data).forEach(([ key, val ]) => {
						newData[key] = { state: val, updatedAt: updateTime };
					});
					const emitData = { deviceID: _id, data: newData, updatedAt: updateTime };
					control.forEach((id) => {
						io.to(id.toString()).emit('control', emitData);
					});

					processControlData({ _id, control: controlObj, info }, data);
				} else console.log('invalid key');
			} else if (restTopic === '/ack') {
				const updateTime = new Date();
				const data = JSON.parse(message.toString());
				const dev = await Device.findOne({ createdBy: ownerId, topic: deviceTopic }, 'control.recipe');
				const jsonKeys = dev.control.recipe.map((obj) => obj.JSONkey);
				const result = map(flip(contains)(jsonKeys), keys(data));

				if (Number(data.ack) === 1) {
					// just alive ack
					const { permissions: { control = [] }, _id } = await Device.updateAck(ownerId, deviceTopic);

					control.forEach((id) => {
						io.to(id.toString()).emit('ack', { deviceID: _id, updatedAt: updateTime });
					});
				} else if (all(equals(true), result)) {
					// ack some update
					console.log('saving to db updateState ack');
					// TODO missing validation of state -> need to look into db for type -> validate -> update document
					const {
						permissions: { control = [] },
						_id,
						control: controlObj,
						info
					} = await Device.updateStateByDevice(ownerId, deviceTopic, data, updateTime);

					let newData = {};
					toPairs(data).forEach(([ key, val ]) => {
						newData[key] = {
							state: val,
							updatedAt: updateTime,
							inTransition: false,
							transitionEnded: updateTime
						};
					});
					const emitData = { deviceID: _id, data: newData, updatedAt: updateTime };
					control.forEach((id) => {
						io.to(id.toString()).emit('control', emitData);
					});

					processControlData({ _id, control: controlObj, info }, data);
				} else console.log('error missing JSONkey');
			}
		} catch (err) {
			console.log('error', err);
		}
	});

	client.on('error', function(err) {
		console.log('mqtt connection error');
		// client.reconnect()
	});
};