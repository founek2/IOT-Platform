import argon2 from 'argon2';
import { addHours } from 'date-fns/addHours';
import { logger } from '../logger/index.js';
import mongoose from 'mongoose';
import dotify from 'node-dotify';
import { Either, Left, Right } from 'purify-ts/Either';
import { Just, Maybe, Nothing } from 'purify-ts/Maybe';
import { AuthType } from '../constants/index.js';
import { DeviceModel } from '../models/deviceModel.js';
import { IAccessToken, IOauth, IRefreshToken, IUser, Permission } from '../models/interface/userInterface.js';
import { NotifyModel } from '../models/notifyModel.js';
import { IToken, TokenModel, TokenType } from '../models/tokenModel.js';
import { UserModel } from '../models/userModel.js';
import { JwtService } from '../services/jwtService.js';
import { Security } from './SecurityService.js';
import { IUserDocument } from '../models/schema/userSchema.js';
import { EitherAsync } from 'purify-ts';

const ObjectId = mongoose.Types.ObjectId;

async function createHash(plainText: string) {
    return argon2.hash(plainText);
}

function comparePasswd(plainText: string, hash: string) {
    return argon2.verify(hash, plainText);
}

function saltFromUserName(userName: string): Buffer {
    return Buffer.from(userName.repeat(2))
}

export type UserWithToken = { doc: IUser; token: string };
export type CredentialData = {
    userName: IUser['info']['userName'];
    password: string;
    authType: AuthType;
};

/**
 * User service handles complicated data manipulation with user
 */
export class UserService {
    jwtService: JwtService

    constructor(jwtService: JwtService) {
        this.jwtService = jwtService
    }

    /**
     * Create new user
     */
    async create(
        object: Omit<IUser, 'realm' | 'groups' | 'createdAt' | 'updatedAt' | 'notifyTokens' | 'pushSubscriptions'>
    ): Promise<{ doc: IUser }> {
        const { password, oauth } = object.auth;

        logger.debug('user creating:', object);

        const rootExists = await UserModel.exists({ groups: 'root' });
        const types = [password ? AuthType.passwd : AuthType.oauth];

        const user = new UserModel({
            ...object,
            auth: {
                types,
                password: password ? await createHash(password) : undefined,
                oauth,
            },
            realm: object.info.userName,
            groups: rootExists ? ['user'] : ['root'],
        });
        const obj = await user.save();
        const plainUser = obj.toObject();

        return { doc: plainUser };
    }

    /**
     * Compare credentials with one saved in DB
     */
    async checkCreditals({
        userName,
        authType,
        password,
    }: CredentialData, userAgent: string): Promise<Either<string, IUserDocument>> {
        if (authType !== AuthType.passwd) return Left('notImplemented');

        const doc = await UserModel.findOne({ 'info.userName': userName, 'auth.types': authType });
        if (!doc) return Left('unknownUser');

        const matched = await comparePasswd(password, doc.auth.password as string);
        if (!matched) return Left('passwordMissmatch');

        return Right(doc)
    }

    async checkAndCreateCreditals({
        userName,
        authType,
        password,
    }: CredentialData, userAgent: string): Promise<Either<string, { doc: IUserDocument; accessToken: string, refreshToken: string }>> {
        const checked = await this.checkCreditals({ userName, authType, password }, userAgent)
        if (checked.isLeft())
            // return checked.leftOrDefault("failed")
            return Left(checked.leftOrDefault(""))

        const doc = checked.unsafeCoerce()
        const tokens = await this.createTokens(doc, userAgent)

        return tokens.map(t => ({ ...t, doc }))
    }

    async createTokens(user: IUser, userAgent: string): Promise<Either<string, { accessToken: string, refreshToken: string }>> {
        return EitherAsync<string, { accessToken: string, refreshToken: string }>(async ({ fromPromise }) => {
            const refreshTokenDoc = await fromPromise(this.createRefreshToken(user._id, userAgent))
            const refreshToken = await this.jwtService.signRefreshToken({ jti: refreshTokenDoc._id, sub: user._id });
            const accessToken = await this.jwtService.sign({ sub: user._id, iss: refreshTokenDoc._id, groups: user.groups, realm: user.realm });

            return {
                accessToken,
                refreshToken,
            }
        }).run()
    }

    //Promise<Either<"unknownUser", { doc: IUser; accessToken: string }>>
    async refreshToken(refreshToken: string) {
        return EitherAsync.fromPromise(() => this.jwtService.verifyRefreshToken(refreshToken)).chain(async token => {
            const doc = await UserModel.findOne({ '_id': new ObjectId(token.sub) })
            if (!doc) return Left("unknownUser");

            const refreshTokenDoc = doc.refreshTokens?.find((r) => r._id.toString() === token.jti)
            if (!refreshTokenDoc) return Left('invalidToken');
            if (refreshTokenDoc?.validTo && Date.now() > refreshTokenDoc.validTo.getTime()) {
                return Left('disabledToken');
            }

            const accessToken = await this.jwtService.sign({ sub: doc._id, iss: refreshTokenDoc._id, groups: doc.groups, realm: doc.realm });
            return Right({
                accessToken,
                doc: doc.toObject(),
            })
        }).run()
    }

    /**
     * Compare credentials with one saved in DB
     */
    async refreshOauthAuthorization(
        email: string,
        userName: string,
        oauth: IOauth,
        userAgent: string
    ): Promise<Either<string, { accessToken: string; refreshToken: string; doc: IUser; oldOauth?: IOauth }>> {
        let doc = await UserModel.findOneAndUpdate({ 'info.email': email }, { 'auth.oauth': oauth });
        if (!doc) {
            const { doc } = await this.create({
                info: {
                    userName,
                    email,
                },
                auth: {
                    oauth,
                },
            } as any);

            return (await this.createTokens(doc, userAgent)).map(t => ({
                doc,
                oldOAuth: undefined,
                ...t
            }))
        }

        return (await this.createTokens(doc, userAgent)).map(t => ({
            ...t,
            doc: doc!.toObject(),
        }))



        // const token = await this.jwtService.sign({ sub: doc._id, iss: groups: doc.groups });
        // return Just({
        //     token,
        //     doc: doc.toObject(),
        //     oldOauth: doc.auth.oauth,
        // });
    }

    removeAuthorization(id: IUser['_id']) {
        UserModel.updateOne({ _id: ObjectId(id) }, { 'auth.oauth': undefined });
    }

    async getAuthorization(id: IUser['_id']): Promise<Maybe<IOauth>> {
        let doc = await UserModel.findOne({ _id: ObjectId(id) }, { 'auth.oauth': 1 }).lean();
        return doc?.auth.oauth ? Just(doc.auth.oauth) : (Nothing as Maybe<IOauth>);
    }

    /**
     * Update user
     */
    async updateUser(userID: IUser['_id'], data: Partial<IUser>) {
        if (data.auth && data.auth.password) {
            const { password } = data.auth;
            const hash = await createHash(password);
            data.auth.password = hash;
        } else delete data.auth;

        const doc = await UserModel.findOneAndUpdate(
            { _id: ObjectId(userID) },
            { $set: dotify(data), $addToSet: { 'auth.types': AuthType.passwd } }
        );
        if (!doc) return Left('unknownUser');

        return Right(doc);
    }

    async changePassword(userID: IUser['_id'], password: string) {
        const hash = await createHash(password);
        const doc = await UserModel.findOneAndUpdate({ _id: ObjectId(userID) }, { 'auth.password': hash });
        if (!doc) return Left('unknownUser');

        return Right(doc);
    }

    /**
     * Update user
     */
    async updateAccessToken(
        tokenId: IAccessToken['_id'],
        userID: IUser['_id'],
        accessToken: { name: string; permissions: Permission[]; validTo?: Date }
    ) {
        UserModel.updateOne(
            { _id: ObjectId(userID), 'accessTokens._id': ObjectId(tokenId) },
            {
                $set: {
                    'accessTokens.$.name': accessToken.name,
                    'accessTokens.$.permissions': accessToken.permissions,
                    'accessTokens.$.validTo': accessToken.validTo,
                },
            }
        ).exec();
    }

    async createRefreshToken(userID: IUser['_id'], userAgent: string): Promise<Either<"unableToCreate", IRefreshToken>> {
        const doc = await UserModel.findById(userID).lean();
        if (!doc) return Left('unableToCreate');

        const data: IRefreshToken = {
            _id: new ObjectId(),
            createdAt: new Date(),
            userAgent
        }

        await UserModel.updateOne(
            {
                _id: ObjectId(userID),
            },
            {
                $push: {
                    refreshTokens: data
                },
            }
        );

        return Right(data);
    }

    async createAccessToken(data: { name: string; permissions: Permission[]; validTo?: Date }, userID: IUser['_id']) {
        const newRawToken: IAccessToken = {
            ...data,
            token: Security.getRandomToken(30),
            createdAt: new Date(),
        };
        if (await UserModel.exists({ 'accessTokens.token': newRawToken.token })) return Left('unableToCreate');
        const doc = await UserModel.findById(userID).lean();
        if (!doc) return Left('unableToCreate');

        const hashedToken = await argon2.hash(newRawToken.token, {
            salt: saltFromUserName(doc.info.userName)
        })
        await UserModel.updateOne(
            {
                _id: ObjectId(userID),
            },
            {
                $push: {
                    accessTokens: {
                        ...newRawToken, token: hashedToken
                    }
                },
            }
        ).lean();


        const encodedToken = Buffer.from(`${doc.info.userName}:${newRawToken.token}`).toString("base64");
        return Right({ ...newRawToken, token: encodedToken });
    }

    async validateAccessToken(accessToken: string): Promise<Either<"invalid", [mongoose.LeanDocument<IUserDocument>, IAccessToken]>> {
        try {
            const rawAccessToken = Buffer.from(accessToken, "base64").toString()
            const [userName, rawToken] = rawAccessToken.split(":")
            if (!userName || !rawToken) throw new Error("invalid")

            const hashedToken = await argon2.hash(rawToken, {
                salt: saltFromUserName(userName),
            })

            const user = await UserModel.findOne(
                {
                    "info.userName": userName,
                    'accessTokens': {
                        $elemMatch: {
                            token: hashedToken,
                            validTo: { $not: { $gt: new Date() } }
                        }
                    }
                }, 'accessTokens.$ groups info'
            ).lean();
            if (!user) throw new Error("invalid")

            return Right([user, user.accessTokens![0]])
        } catch (err: any) {
            logger.debug("Token v2 verification failed:", 'message' in err ? err.message : err)
        }

        const user = await UserModel.findOne(
            {
                'accessTokens': {
                    $elemMatch: {
                        token: accessToken,
                        validTo: { $not: { $gt: new Date() } }
                    }
                }
            },
            'accessTokens.$ groups info'
        ).lean();
        if (!user) return Left('invalid');

        logger.warning("Access token v1 detected for user", user.info.userName)
        return Right([user, user.accessTokens![0]])
    }

    async deleteAccessToken(tokenId: IAccessToken['_id'], userID: IUser['_id']) {
        UserModel.updateOne(
            { _id: ObjectId(userID) },
            {
                $pull: {
                    accessTokens: { _id: ObjectId(tokenId) },
                },
            }
        ).exec();
    }

    /**
     * Delete user from DB and all his permissions from devices + his notification rules
     */
    async deleteById(id: IUser['_id']): Promise<boolean> {
        const userId = ObjectId(id);

        const result = await UserModel.deleteOne({
            _id: userId,
        });

        if (result.deletedCount !== 1) return false;
        NotifyModel.deleteMany({
            userId: userId,
        }).exec();

        DeviceModel.updateMany({
            $pull: {
                'permissions.read': userId,
                'permissions.control': userId,
                'permissions.write': userId,
            },
        }).exec();

        return true;
    }

    /**
     * Generate forgot token for user
     */
    async forgotPassword(email: IUser['info']['email']): Promise<Either<string, { token: IToken; user: IUser }>> {
        const user = await UserModel.findOne({ 'info.email': email }).lean();
        if (!user) return Left('userNotExist');

        const token = await TokenModel.create({
            type: TokenType.forgot_password,
            data: Security.getRandomToken(64),
            validTo: addHours(new Date(), 5),
            userId: user._id,
        });
        return Right({ token: token, user });
    }
};
