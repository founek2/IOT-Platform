import mongoose, { Document, Model } from 'mongoose';
import { IUser } from './interface/userInterface.js';

export enum TokenType {
    forgot_password = 'forgot_password',
}

const Schema = mongoose.Schema;

export interface IToken {
    data: string;
    validTo: Date;
    used: boolean;
    type: TokenType;
    userId: IUser['_id'];
}

export interface ITokenDocument extends Document, IToken { }

export interface ITokenModel extends Model<ITokenDocument> {
    retrieve(data: IToken['data']): Promise<IToken | null>;
}

const tokenSchema = new Schema({
    data: { type: String, required: true },
    validTo: { type: Date, required: true },
    used: { type: Boolean, required: true, default: false },
    type: { type: String, required: true, enum: Object.values(TokenType) },
    userId: { type: Schema.Types.ObjectId, required: true },
});

tokenSchema.statics.retrieve = async function (data: IToken['data']) {
    return this.findOneAndUpdate(
        {
            data,
            validTo: { $gte: new Date() },
            used: false,
        },
        { used: true }
    ).lean();
};

export const TokenModel = mongoose.model<ITokenDocument, ITokenModel>('Token', tokenSchema);
