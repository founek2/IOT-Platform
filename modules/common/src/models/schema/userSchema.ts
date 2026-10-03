import mongoose, { Document } from 'mongoose';
import { IUser } from '../interface/userInterface.js';

export interface IUserDocument extends IUser, Document { }

export const userSchemaPlain = {
    info: {
        userName: { type: String, required: true, index: { unique: true } },
        firstName: { type: String },
        lastName: { type: String },
        email: { type: String, lowercase: true, index: { unique: true } },
    },
    auth: {
        types: { type: Array },
        password: { type: String },
        oauth: {
            provider: String,
            accessToken: String,
            expiresIn: Number,
            refreshToken: String,
            tokenType: String,
            userId: Number,
        },
    },
    groups: { type: [String], default: ['user'] as IUser['groups'] },
    devices: Object, // {sensors: {order: [id, id, id]}, }
    // preferences: {colorMode: light, devices: [{_id: xxx, order: 10, {things: [{_id: xxx, order: 11}]}}]}
    notifyTokens: [],
    pushSubscriptions: [],
    accessTokens: [
        {
            name: String,
            token: { type: String },
            permissions: [{ type: String, enum: ['read', 'write', 'control'] }],
            createdAt: Date,
            validTo: Date,
        },
    ],
    refreshTokens: [{
        validTo: Date,
        createdAt: Date,
        userAgent: String,
    }],
    realm: String,
    dashboard: {
        preferences: [{
            _id: false,
            propertyId: String,
            thingId: String,
            group: String,
        }],
    },
};
