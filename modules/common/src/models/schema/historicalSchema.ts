import mongoose, { Document } from 'mongoose';
import { HistoricalSensor } from '../interface/history.js';

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

export interface IHistorical extends HistoricalSensor, Document { }

export const historicalSchemaPlain = {
    deviceId: ObjectId,
    thingId: ObjectId,
    day: Date,
    first: Date,
    last: Date,
    properties: {
        type: Map,
        of: new Schema({
            max: Number,
            min: Number,
            nsamples: {
                night: Number,
                Day: Number,
            },
            samples: [{ value: Schema.Types.Mixed, timestamp: Date }],
            sum: {
                night: Number,
                Day: Number,
            },
        }),
    },
    nsamples: Number,
};

/// This is how it might look, to make it more flat
// export const historicalSchemaPlain = {
//     deviceId: ObjectId,
//     thingId: ObjectId,
//     propertyId: ObjectId,
//     data: { value: Schema.Types.Mixed, timestamp: Date },
// };
