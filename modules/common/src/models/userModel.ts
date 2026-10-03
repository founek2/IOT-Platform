import mongoose, { Model } from 'mongoose';
import { IUser, PushSubscription, IRefreshToken, IUserDashboard } from './interface/userInterface.js';
import { IUserDocument, userSchemaPlain } from './schema/userSchema.js';
import { NotifyModel } from './notifyModel.js';
import { DeviceModel } from './deviceModel.js';

const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;

export const userSchema = new Schema<IUserDocument, IUserModel>(userSchemaPlain, {
    toObject: {
        transform: function (doc, ret) {
            ret.id = ret._id.toString();
            delete ret.__v;
            // delete ret._id;
            delete ret.accessTokens;
            delete ret.refreshTokens;
            delete ret.auth;
        },
    },
    timestamps: true,
});

export interface IUserModel extends Model<IUserDocument> {
    findByUserName(userName: string): Promise<IUser | null>;
    findAllNotRoot(): Promise<IUserDocument[]>;
    findAll(): Promise<IUserDocument[]>;
    removeUsers(ids: Array<IUser['_id']>): Promise<{ deletedCount?: number }>;
    findAllUserNames(): Promise<Array<{ _id: IUserDocument['_id']; info: { userName: string } }>>;
    addNotifyToken(userId: IUser['_id'], subscription: PushSubscription): Promise<void>;
    modifyNotifyToken(oldSubsrciption: PushSubscription, newSubscription: PushSubscription): Promise<boolean>;
    removeNotifyTokens(tokens: string[]): Promise<void>;
    getNotifyTokens(userId: IUser['_id']): Promise<{ notifyTokens: string[] }>;
    getSubscriptions(userId: IUser['_id']): Promise<Pick<IUser, "_id" | "pushSubscriptions">>;
    removeSubscription(userId: IUser['_id'], subscription: PushSubscription): Promise<void>;
    checkExists(userId?: string): Promise<boolean>;
    invalidateRefreshToken(userID: IUser['_id'], refreshTokenId: IRefreshToken["_id"]): Promise<mongoose.UpdateWriteOpResult>
    setUserDashboard(userId: IUser['_id'], dashboard: IUserDashboard): Promise<void>;
}

userSchema.statics.findByUserName = function (userName: string) {
    return this.findOne({ 'info.userName': userName }).lean();
};

userSchema.statics.findAll = function () {
    return this.find({});
};

userSchema.statics.findAllNotRoot = function () {
    return this.find({ groups: { $ne: 'root' } });
};

userSchema.statics.removeUsers = function (arrayOfIDs: Array<IUser['_id']>) {
    const ids = arrayOfIDs.map((id) => mongoose.Types.ObjectId(id));
    NotifyModel.deleteMany({
        user: { $in: ids },
    }).exec();
    DeviceModel.updateMany(
        {},
        {
            $pull: {
                // @ts-ignore
                'permissions.read': { $in: ids },
                'permissions.write': { $in: ids },
                'permissions.control': { $in: ids },
            },
        }
    ).exec();
    return this.deleteMany({ _id: { $in: ids } });
};

userSchema.statics.findAllUserNames = function () {
    return this.find({}, 'info.userName').lean().sort({ 'info.userName': 1 });
};

userSchema.statics.addNotifyToken = function (userID: IUser['_id'], subscription: PushSubscription) {
    return this.updateOne({ _id: ObjectId(userID) }, { $addToSet: { pushSubscriptions: subscription } });
};

userSchema.statics.modifyNotifyToken = async function (subscriptionOld: PushSubscription, subscriptionNew: PushSubscription) {
    const user = await this.findOneAndUpdate({
        "pushSubscriptions.endpoint": subscriptionOld.endpoint,
    }, { $pull: { "pushSubscriptions": { $eq: { endpoint: subscriptionOld.endpoint } } } }).lean();
    if (user == null) return false;

    return this.addNotifyToken(user._id, subscriptionNew)
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

userSchema.statics.getNotifyTokens = function (userID: IUser['_id']) {
    return this.findOne({ _id: ObjectId(userID) })
        .select('notifyTokens')
        .lean();
};
userSchema.statics.getSubscriptions = function (userID: IUser['_id']) {
    return this.findOne({ _id: ObjectId(userID) })
        .select('pushSubscriptions')
        .lean();
};
userSchema.statics.removeSubscription = function (userId: IUser['_id'], subscription: PushSubscription) {
    return this.updateOne({ _id: ObjectId(userId) }, {
        $pull: {
            "pushSubscriptions": { endpoint: subscription.endpoint }
        }
    }).exec()
};

userSchema.statics.checkExists = async function (userID: IUser['_id']) {
    return this.exists({
        _id: mongoose.Types.ObjectId(userID),
    });
};

userSchema.statics.invalidateRefreshToken = async function (userID: IUser['_id'], refreshTokenId: IRefreshToken["_id"]) {
    // {
    //     _id: new ObjectId(),
    //     createdAt: new Date(),
    //     userAgent
    // }
    return this.updateOne({
        _id: mongoose.Types.ObjectId(userID),
        "refreshTokens._id": refreshTokenId,
    }, {
        "refreshTokens.$.validTo": new Date()
    }).exec();
};

userSchema.statics.setUserDashboard = async function (userId: IUser['_id'], dashboard: IUserDashboard) {
    return this.updateOne({ _id: ObjectId(userId) }, { $set: { dashboard } }).exec();
};

export const UserModel = mongoose.model<IUserDocument, IUserModel>('User', userSchema);
