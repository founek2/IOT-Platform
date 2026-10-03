import { logger } from '../logger/index.js';
import mongoose, { Model } from 'mongoose';
import { IThing } from './interface/thing.js';
import { deviceSchemaPlain, IDeviceDocument } from './schema/deviceSchema.js';
import { IDevice } from './interface/device.js';
import { IUser } from './interface/userInterface.js';

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

interface Realm {
    name: string;
}

interface RealmMetadata {
    realm: IDevice['metadata']['realm'];
    deviceId: IDevice['metadata']['deviceId'];
}

export const deviceSchema = new Schema<IDeviceDocument, IDeviceModel>(deviceSchemaPlain, {
    toObject: {
        transform: function (doc, ret) {
            delete ret.apiKey;
        },
    },
    timestamps: true,
});
deviceSchema.index({ 'metadata.realm': 1, 'metadata.deviceId': 1 }, { unique: true });

export type Metadata = { realm: string; deviceId: string };
export interface IDeviceModel extends Model<IDeviceDocument> {
    createNew(device: { info: any; things: IThing[]; metadata: Metadata }, ownerId: string): Promise<IDeviceDocument>;
    checkIdTaken(metadata: Metadata): Promise<boolean>;
    // findForPublic(): Promise<IDevice[]>;
    findForUser(userId: string): Promise<IDeviceDocument[]>;
    login(realm: string, deviceId: string, apiKey: string): Promise<boolean>;
    checkExists(id: IDevice['_id']): Promise<boolean>;
    checkExistsByMetadata(deviceId: IDevice['metadata']["deviceId"]): Promise<boolean>;
    checkWritePerm(id: IDevice['_id'], userId: IUser['_id']): Promise<boolean>;
    checkReadPerm(id: IDevice['_id'], userId: IUser['_id']): Promise<boolean>;
    checkControlPerm(id: IDevice['_id'], userId: IUser['_id']): Promise<boolean>;
    checkRealmControlPerm(metadata: RealmMetadata, userId: IUser['_id']): Promise<boolean>;
    checkRealmReadPerm(metadata: RealmMetadata, userId: IUser['_id']): Promise<boolean>;
    updateByFormData(id: IDevice['_id'], object: Partial<IDevice>): Promise<void>;

    findAllRealms(): Promise<Realm[]>;
    findByRealm(realm: string, deviceId: string): Promise<IDevice | null>;
}

deviceSchema.statics.checkIdTaken = async function (metadata) {
    return (await this.exists({
        'metadata.deviceId': metadata.deviceId,
        'metadata.realm': metadata.realm,
    })) !== null;
};
deviceSchema.statics.createNew = async function ({ info, things, metadata }, userID) {
    const objID = new ObjectId(userID);

    const newDevice = await this.create({
        info,
        things,
        permissions: { read: [objID], write: [objID], control: [objID] },
        metadata,
        createdBy: objID,
    });
    // if (imgExtension) newDevice.info.imgPath = `/${IMAGES_DEVICES_FOLDER}/${newDevice.id}.${imgExtension}`;
    logger.debug('Creating device', newDevice);
    return newDevice;
};

const aggregationFields = {
    _id: 1,
    info: 1,
    things: 1,
    createdAt: 1,
    createdBy: 1,
    state: 1,
    metadata: 1,
};

deviceSchema.statics.findForUser = async function (userID) {
    const userObjID = new ObjectId(userID);
    return this.aggregate([
        {
            $match: {
                $or: [
                    { publicRead: true },
                    { 'permissions.write': userObjID },
                    { 'permissions.read': userObjID },
                    { 'permissions.control': userObjID },
                ],
            },
        },
        {
            $project: {
                ...aggregationFields,
                permissions: {
                    read: {
                        $cond: {
                            if: { $in: [userObjID, '$permissions.read'] },
                            then: '$permissions.read',
                            else: '$$REMOVE',
                        },
                    },
                    write: {
                        $cond: {
                            if: { $in: [userObjID, '$permissions.write'] },
                            then: '$permissions.write',
                            else: '$$REMOVE',
                        },
                    },
                    control: {
                        $cond: {
                            if: { $in: [userObjID, '$permissions.control'] },
                            then: '$permissions.control',
                            else: '$$REMOVE',
                        },
                    },
                },
            },
        },
    ]);
};

deviceSchema.statics.login = async function (realm: string, deviceId: string, apiKey: string) {
    return (await this.exists({
        'metadata.realm': realm,
        'metadata.deviceId': deviceId,
        apiKey: apiKey,
    })) !== null;
};

deviceSchema.statics.checkExists = async function (id: IDevice['_id']) {
    return (await this.exists({
        _id: new ObjectId(id),
    })) !== null;
};

deviceSchema.statics.checkExistsByMetadata = async function (deviceId: IDevice['metadata']["deviceId"]) {
    return (await this.exists({
        'metadata.deviceId': deviceId,
    })) !== null;
};

deviceSchema.statics.checkWritePerm = async function (id: IDevice['_id'], userId: IUser['_id']) {
    const userID = new ObjectId(userId);
    return (await this.exists({
        _id: new ObjectId(id),
        'permissions.write': userID,
    })) !== null;
};

deviceSchema.statics.checkReadPerm = async function (id: IDevice['_id'], userId: IUser['_id']) {
    const userID = new ObjectId(userId);
    return (await this.exists({
        _id: new ObjectId(id),
        'permissions.read': userID,
    })) !== null;
};

deviceSchema.statics.checkControlPerm = async function (id: IDevice['_id'], userId: IUser['_id']) {
    const userID = new ObjectId(userId);
    return (await this.exists({
        _id: new ObjectId(id),
        'permissions.control': userID,
    })) !== null;
};

deviceSchema.statics.checkRealmControlPerm = async function (
    metadata: RealmMetadata,
    userId: IUser['_id']
): Promise<boolean> {
    const userID = new ObjectId(userId);
    return (await this.exists({
        'metadata.realm': metadata.realm,
        'metadata.deviceId': metadata.deviceId,
        'permissions.control': userID,
    })) !== null;
};
deviceSchema.statics.checkRealmReadPerm = async function (
    metadata: RealmMetadata,
    userId: IUser['_id']
): Promise<boolean> {
    const userID = new ObjectId(userId);
    return (await this.exists({
        'metadata.realm': metadata.realm,
        'metadata.deviceId': metadata.deviceId,
        'permissions.read': userID,
    })) !== null;
};

deviceSchema.statics.updateByFormData = function (id: IDevice['_id'], object: Partial<IDevice>) {
    return this.updateOne(
        {
            _id: new ObjectId(id),
        },
        object
    );
};

deviceSchema.statics.findAllRealms = async function (): Promise<Realm[]> {
    const realmArray = await this.find({}).distinct('metadata.realm').lean<string[]>();

    return realmArray.map((name) => ({ name }));
};
deviceSchema.statics.findByRealm = function (realm: string, deviceId: string) {
    return this.findOne({
        'metadata.realm': realm,
        'metadata.deviceId': deviceId,
    }).lean();
};

export const DeviceModel = mongoose.model<IDeviceDocument, IDeviceModel>('DeviceAdded', deviceSchema);
