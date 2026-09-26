import mongoose, { Document, Model } from 'mongoose';
import hat from 'hat';
import { IDevice } from '../interface/device.js';
import { IUser } from '../interface/userInterface.js';
import { thingSchema } from './thingSchema.js';

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

export interface IDeviceDocument extends IDevice, Document {
    createdBy: IUser['_id'];
}

export const deviceSchemaPlain = {
    info: {
        name: { type: String },
        description: { type: String },
        imgPath: { type: String },
        location: {
            building: String,
            room: String,
        },
    },
    apiKey: { type: String, default: hat as any, index: { unique: true } },
    permissions: {
        read: [{ type: ObjectId, ref: 'User' }],
        write: [{ type: ObjectId, ref: 'User' }],
        control: [{ type: ObjectId, ref: 'User' }],
    },
    createdBy: { type: ObjectId, ref: 'User' },
    things: [thingSchema],
    state: {
        status: {
            value: Schema.Types.Mixed,
            timestamp: Date,
        },
        lastAck: Date,
    },
    metadata: {
        realm: { type: String, required: true },
        deviceId: { type: String, required: true },
        publicRead: Boolean,
    },
};
