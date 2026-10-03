import mongoose, { Document, Model } from "mongoose";
import { IDiscovery } from "./interface/discovery.js";
import { IUser } from "./interface/userInterface.js";

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

export interface IDiscoveryDocument extends Omit<IDiscovery, '_id'>, Document { }

const deviceDiscoverySchema = new Schema<IDiscoveryDocument, IDiscoveryModel>(
    {
        deviceId: String,
        realm: String,
        name: String,
        nodeIds: Array,
        things: Schema.Types.Mixed,
        state: {
            status: {
                value: String,
                timestamp: Date,
            },
        },
        pairing: Boolean,
    },
    { timestamps: true }
);

export interface IDiscoveryModel extends Model<IDiscoveryDocument> {
    checkExists(id: IDiscovery["_id"]): Promise<boolean>;
    checkExistsNotPairing(id: IDiscovery["_id"]): Promise<boolean>;
    checkPermissions(id: IDiscovery["_id"], realm: IUser["realm"]): Promise<boolean>;
}

deviceDiscoverySchema.statics.checkExists = async function (id: IDiscovery["_id"]) {
    return (await this.exists({
        _id: new ObjectId(id),
    })) !== null;
};

deviceDiscoverySchema.statics.checkExistsNotPairing = async function (id: IDiscovery["_id"]) {
    return (await this.exists({
        _id: new ObjectId(id),
        pairing: { $ne: true },
    })) !== null;
};

deviceDiscoverySchema.statics.checkPermissions = async function (id: IDiscovery["_id"], realm: IUser["realm"]) {
    return (await this.exists({
        _id: new ObjectId(id),
        realm,
    })) !== null;
};

export const DiscoveryModel = mongoose.model<IDiscoveryDocument, IDiscoveryModel>("Discovery", deviceDiscoverySchema);
