import mongoose from "mongoose";
import { INotifyThing } from "../interface/notifyInterface.js";

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

export const notifyPropertySchema = new Schema(
	{
		propertyId: String,
		type: String,
		value: String,
		textTemplate: String,
		advanced: {
			interval: { $type: Number, default: -1 },
			from: { $type: String, default: "00:00" },
			to: { $type: String, default: "23:59" },
			daysOfWeek: { $type: Array, default: [0, 1, 2, 3, 4, 5, 6] },
		},
		tmp: {
			lastSendAt: Date,
			lastSatisfied: Boolean,
		},
	},
	{ typeKey: "$type" }
);

export const notifyThingSchema = new Schema({
	nodeId: String,
	properties: [notifyPropertySchema],
});
