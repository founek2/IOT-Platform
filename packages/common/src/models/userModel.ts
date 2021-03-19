import mongoose, { Model, Query } from "mongoose";
import { IUser } from "./interface/userInterface";
import { IUserDocument, userSchema } from "./schema/userSchema";
import { NotifyModel } from "./notifyModel";
import { DeviceModel } from "./deviceModel";
import { keys } from "ramda";
import { devLog } from "framework/lib/logger";

const ObjectId = mongoose.Types.ObjectId;

type CredentialData = {
	userName: IUser["info"]["userName"];
	password: IUser["auth"]["password"];
	authType: IUser["auth"]["type"];
};
type UserWithToken = { doc: IUser; token: string };

export interface IUserModel extends Model<IUserDocument> {
	findByUserName(userName: string): Promise<IUserDocument>;
	findAllNotRoot(): Promise<IUserDocument[]>;
	findAll(): Promise<IUserDocument[]>;
	removeUsers(ids: Array<IUser["_id"]>): Promise<{ deletedCount?: number }>;
	findAllUserNames(): Promise<Array<{ info: { userName: string } }>>;
	addNotifyToken(userId: IUser["_id"], token: string): Promise<void>;
	removeNotifyTokens(tokens: string[]): Promise<void>;
	getNotifyTokens(userId: IUser["_id"]): Promise<{ notifyTokens: string[] }>;
	checkExist(userId?: string): Promise<boolean>;
}

userSchema.statics.findByUserName = function (userName) {
	return this.findOne({ "info.userName": userName });
};

userSchema.statics.findAll = function () {
	return this.find({});
};

userSchema.statics.findAllNotRoot = function () {
	return this.find({ groups: { $ne: "root" } });
};

userSchema.statics.removeUsers = function (arrayOfIDs: Array<IUser["_id"]>) {
	const ids = arrayOfIDs.map((id) => mongoose.Types.ObjectId(id));
	NotifyModel.deleteMany({
		user: { $in: ids },
	}).exec();
	DeviceModel.updateMany(
		{},
		{
			$pull: {
				"permissions.read": { $in: ids },
				"permissions.write": { $in: ids },
				"permissions.control": { $in: ids },
			},
		}
	).exec();
	return this.deleteMany({ _id: { $in: ids } });
};

userSchema.statics.findAllUserNames = function () {
	return this.find(
		{
			groups: { $ne: "root" },
		},
		"info.userName"
	)
		.lean()
		.sort({ "info.userName": 1 });
};

userSchema.statics.addNotifyToken = function (userID: IUser["_id"], token: string) {
	return this.updateOne({ _id: ObjectId(userID) }, { $addToSet: { notifyTokens: token } });
};

userSchema.statics.removeNotifyTokens = function (tokens) {
	return this.updateMany(
		{
			notifyTokens: { $in: tokens },
		},
		{
			$pull: { notifyTokens: { $in: tokens } },
		}
	).exec();
};

userSchema.statics.getNotifyTokens = function (userID: IUser["_id"]) {
	return this.findOne({ _id: ObjectId(userID) })
		.select("notifyTokens")
		.lean();
};

userSchema.statics.checkExist = async function (userID = "") {
	if (userID.length != 24) return false;

	return await this.exists({
		_id: mongoose.Types.ObjectId(userID),
	});
};

export const UserModel = mongoose.model<IUserDocument, IUserModel>("User", userSchema);