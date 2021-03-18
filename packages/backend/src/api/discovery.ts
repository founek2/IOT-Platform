import fieldDescriptors from "common/lib/fieldDescriptors";
import { DiscoveryModel } from "common/lib/models/deviceDiscoveryModel";
import { DeviceModel } from "common/lib/models/deviceModel";
import { IDiscoveryProperty, IDiscoveryThing } from "common/lib/models/interface/discovery";
import { ComponentType, IThing, PredefinedComponentType, ThingProperties } from "common/lib/models/interface/thing";
import formDataChecker from "framework/lib/middlewares/formDataChecker";
import resource from "framework/lib/middlewares/resource-router-middleware";
import tokenAuthMIddleware from "framework/lib/middlewares/tokenAuth";
import mongoose from "mongoose";
import { assoc, assocPath, ifElse, lensPath, map, o, over, pathSatisfies, toPairs } from "ramda";
import checkControlPerm from "../middlewares/device/checkControlPerm";
import checkReadPerm from "../middlewares/device/checkReadPerm";
import checkWritePerm from "../middlewares/device/checkWritePerm";
import { Actions } from "../services/actionsService";
import eventEmitter from "../services/eventEmitter";

const ObjectId = mongoose.Types.ObjectId;

function checkRead(req: any, res: any, next: any) {
	if (req.query.type === "sensors") return checkReadPerm()(req, res, next);

	if (req.query.type === "control") return checkControlPerm()(req, res, next);

	if (req.query.type === "apiKey") return checkWritePerm()(req, res, next);
	res.status(208).send({ error: "InvalidParam" });
}

// TODO - iot library -> on reconnect device doesnt send actual status
// TODO - api /device just for single device manipulation
export default () =>
	resource({
		middlewares: {
			index: [tokenAuthMIddleware()],
			delete: [tokenAuthMIddleware(), formDataChecker(fieldDescriptors)],
			create: [tokenAuthMIddleware(), formDataChecker(fieldDescriptors)],
		},

		/** GET / - List all entities */
		async index({ user, root }: any, res: any) {
			console.log("user - ", user.info.userName);
			const docs = await DiscoveryModel.find({ realm: user.realm });

			res.send({ docs });
		},

		async delete({ body, user }: any, res: any) {
			// TODO check permission
			const selected = body.formData.DISCOVERY_DEVICES.selected;
			const result = await DiscoveryModel.deleteMany({
				_id: { $in: selected.map(ObjectId) },
			});
			console.log("deleted", result);
			eventEmitter.emit("devices_delete", selected);
			res.sendStatus(204);
		},

		/** POST / - Create a new entity */
		async create({ body, user }: any, res: any) {
			// TODO permission check
			const { formData } = body;

			if (formData.CREATE_DEVICE) {
				const form = formData.CREATE_DEVICE;

				const doc = await DiscoveryModel.findOne({ _id: ObjectId(form._id) });
				if (!doc) return res.status(208).send({ error: "deviceNotFound" });

				console.log("user is", user);
				function convertProperties([propertyId, property]: [string, IDiscoveryProperty]) {
					return assoc("propertyId", propertyId, property);
				}
				function convertDiscoveryThing([nodeId, thing]: [string, IDiscoveryThing]): IThing {
					return o<IDiscoveryThing, IDiscoveryThing, any>(
						ifElse(
							pathSatisfies<ComponentType, IDiscoveryThing>(
								(componentType) => componentType in PredefinedComponentType,
								["config", "componentType"]
							),
							(thing: IDiscoveryThing) =>
								assocPath(
									["config", "properties"],
									ThingProperties[(thing.config.componentType as unknown) as PredefinedComponentType],
									thing
								),
							over(lensPath(["config", "properties"]), o(map(convertProperties), toPairs))
						),
						assocPath(["config", "nodeId"], nodeId)
					)(thing);
				}

				const convertThings = o<
					{ [propertyId: string]: IDiscoveryThing },
					[string, IDiscoveryThing][],
					IThing[]
				>(map(convertDiscoveryThing), toPairs);
				const newDevice = await DeviceModel.createNew(
					{
						info: { ...form.info },
						things: convertThings(doc.things),
						metadata: {
							realm: doc.realm,
							deviceId: doc.deviceId,
						},
					},
					user.id
				);

				console.log(convertThings(doc.things)[1].config);

				const suuccess = await Actions.deviceInitPairing(doc.deviceId, newDevice.apiKey);
				if (suuccess) {
					doc.pairing = true;
					doc.save();
					res.send({ doc: newDevice });
				} else {
					newDevice.remove();
					res.setStatus(500);
				}
			} else res.sendStatus(500);
		},
	});
