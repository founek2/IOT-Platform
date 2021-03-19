import { devLog } from "framework/lib/logger";
import mongoose, { Model } from "mongoose";
import { IThing } from "./interface/thing";
import { deviceSchema, IDeviceDocument } from "./schema/deviceSchema";

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

export interface IDeviceModel extends Model<IDeviceDocument> {
	createNew(
		device: { info: any; things: IThing[]; metadata: { realm: string; deviceId: string } },
		ownerId: string
	): Promise<IDeviceDocument>;
	// findForPublic(): Promise<IDevice[]>;
	findForUser(userId: string): Promise<IDeviceDocument[]>;
	login(realm: string, deviceId: string, apiKey: string): Promise<boolean>;
}

deviceSchema.statics.createNew = async function ({ info, things, metadata }, userID) {
	const objID = ObjectId(userID);

	const result = await this.exists({
		"metadata.deviceId": metadata.deviceId,
		"metadata.realm": metadata.realm,
	});
	if (result) throw Error("deviceIdTaken");

	const newDevice = await this.create({
		info,
		things,
		permissions: { read: [objID], write: [objID], control: [objID] },
		metadata,
		createdBy: objID,
	});
	// if (imgExtension) newDevice.info.imgPath = `/${IMAGES_DEVICES_FOLDER}/${newDevice.id}.${imgExtension}`;
	devLog("Creating device", newDevice);
	return newDevice;
};

const aggregationFields = {
	_id: 1,
	"gps.coordinates": 1,
	// "gps.type": 0,
	info: 1,
	createdAt: 1,
	createdBy: 1,
	publicRead: 1,
	state: 1,
};

deviceSchema.statics.findForUser = async function (userID) {
	console.log("finding for userID", userID);
	const userObjID = ObjectId(userID);
	return this.aggregate([
		{
			$match: {
				$or: [
					{ publicRead: true },
					{ "permissions.write": userObjID },
					{ "permissions.read": userObjID },
					{ "permissions.control": userObjID },
				],
			},
		},
		{
			$project: {
				...aggregationFields,
				things: {
					$cond: {
						if: {
							$or: [
								{ $in: [userObjID, "$permissions.control"] },
								{ $in: [userObjID, "$permissions.read"] },
							],
						},
						then: "$things",
						else: "$$REMOVE",
					},
				},
				permissions: {
					read: {
						$cond: {
							if: { $in: [userObjID, "$permissions.read"] },
							then: "$permissions.read",
							else: "$$REMOVE",
						},
					},
					write: {
						$cond: {
							if: { $in: [userObjID, "$permissions.write"] },
							then: "$permissions.write",
							else: "$$REMOVE",
						},
					},
					control: {
						$cond: {
							if: { $in: [userObjID, "$permissions.control"] },
							then: "$permissions.control",
							else: "$$REMOVE",
						},
					},
				},
			},
		},
	]);
};

deviceSchema.statics.login = async function (realm: string, deviceId: string, apiKey: string) {
	return await this.exists({
		"metadata.realm": realm,
		"metadata.deviceId": deviceId,
		apiKey: apiKey,
	});
};

export const DeviceModel = mongoose.model<IDeviceDocument, IDeviceModel>("DeviceAdded", deviceSchema);