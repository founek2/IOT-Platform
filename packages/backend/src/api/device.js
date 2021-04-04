import resource from '../middlewares/resource-router-middleware';
import Device from '../models/Device';
import processError from '../utils/processError';
import { saveImageBase64, validateFileExtension, deleteImage } from '../services/files';
import { transformSensorsForBE, transformControlForBE } from 'common/lib/utils/transform';
import tokenAuthMIddleware from '../middlewares/tokenAuth';
import formDataChecker from '../middlewares/formDataChecker';

import fieldDescriptors from 'common/lib/fieldDescriptors';
import checkReadPerm from '../middlewares/device/checkReadPerm';
import checkWritePerm from '../middlewares/device/checkWritePerm';
import checkControlPerm from '../middlewares/device/checkControlPerm';
import Notify from '../models/Notification';
import { handleMapping } from 'common/lib/services/DeviceHandler';
import { contains, __, flip, filter, o, prop } from 'ramda';
import eventEmitter from '../services/eventEmitter';
import agenda from '../agenda';
import { DeviceModel } from 'common/lib/models/deviceModel';
import mongoose from 'mongoose';
import { DeviceService } from '../services/deviceService';
import { Actions } from '../services/actionsService';

// TODO - iot library -> on reconnect device doesnt send actual status
// TODO - api /device just for single device manipulation
export default ({ config, db }) =>
	resource({
		middlewares: {
			index: [ tokenAuthMIddleware() ],
			patchId: [ tokenAuthMIddleware(), checkWritePerm(), formDataChecker(fieldDescriptors) ],
			create: [ tokenAuthMIddleware(), checkWritePerm() ],
			deleteId: [ tokenAuthMIddleware(), checkWritePerm() ]
		},

		/* PUT */
		async patchId({ body, params: { id }, user }, res) {
			const { formData } = body;

			if (formData.EDIT_DEVICE) {
				// tested
				const form = formData.EDIT_DEVICE;
				await DeviceModel.updateByFormData(id, form);
				res.sendStatus(204);
			} else res.sendStatus(400);
		},

		/** POST / - Create a new entity */
		async createId({ body, params }, res) {
			const { formData } = body;
			const doc = await DeviceModel.findById(params.id).lean();

			if (formData.DEVICE_SEND && (await Actions.deviceSendCommand(doc, formData.DEVICE_SEND.command)))
				return res.sendStatus(204);
			res.sendStatus(500);
		},

		/** GET / - List all entities */
		async index({ user, root }, res) {
			if (user) {
				const docs = await DeviceModel.findForUser(user.id);
				res.send({ docs });
			} else {
				// const docs = await DeviceModel.findForPublic(user.id);
				// res.send({docs})
				res.sendStatus(501);
			}
		},
		async deleteId({ params }, res) {
			// TODO delete references in DB - history + notify
			const result = await DeviceService.deleteById(params.id);
			if (result) res.sendStatus(204);
			else res.sendStatus(404);
			eventEmitter.emit('device_delete', params.id);
		}

		/** DELETE - Delete a given entities */
		// async delete({ body, user }, res) {
		// 	const selected = body.formData.DEVICE_MANAGEMENT.selected;
		// 	const result = await DeviceModel.deleteMany({
		// 		_id: { $in: selected.map(mongoose.Types.ObjectId) },
		// 	});
		// 	console.log("deleted", result);
		// 	eventEmitter.emit("devices_delete", selected);
		// 	res.sendStatus(204);
		// },
	});
