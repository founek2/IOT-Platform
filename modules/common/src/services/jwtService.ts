import jwt from 'jsonwebtoken';
import fs from 'fs';
import { logger } from '../logger/index.js';
import { Either, Left, Right } from 'purify-ts';
import { IUser } from '../models/interface/userInterface.js';

interface RefreshTokenPayload {
    jti: string,
    sub: string
}
interface AccessTokenPayload {
    // user ID
    sub: string,
    // refresh token ID
    iss: string
    groups: IUser["groups"]
    realm: string
}
export class JwtService {
    privKey: jwt.Secret
    pubKey: jwt.Secret

    constructor({
        privateKey,
        publicKey,
        expiresIn: exIn,
    }: {
        privateKey: string;
        publicKey: string;
        expiresIn: string;
    }) {
        if (!privateKey) logger.error('JWT invalid privateKey path:', privateKey);
        if (!publicKey) logger.error('JWT invalid publicKey path:', publicKey);
        // if (!exIn) logger.error('JWT invalid expiresIn:', exIn);

        this.privKey = fs.readFileSync(privateKey);
        this.pubKey = fs.readFileSync(publicKey);
    }

    /**
     * Create JWT token from provided object
     * @param object
     * @return JWTtoken
     */
    sign(object: AccessTokenPayload): Promise<string> {
        return new Promise((resolve, reject) => {
            jwt.sign(object, this.privKey, { algorithm: 'RS256', expiresIn: "20min" }, function (err, token) {
                if (!err && token) {
                    resolve(token);
                } else {
                    reject(err);
                }
            });
        });
    }


    /**
     * Create JWT token from provided object
     * @param object
     * @return JWTtoken
     */

    signRefreshToken(object: RefreshTokenPayload): Promise<string> {
        return new Promise((resolve, reject) => {
            jwt.sign(object, this.privKey, { algorithm: 'RS256', audience: "refreshToken" }, function (err, token) {
                if (!err && token) {
                    resolve(token);
                } else {
                    reject(err);
                }
            });
        });
    }

    /**
     * Verify JWT token and decode its content
     * @param token
     * @return token content
     */
    verify(token: string) {
        return new Promise<Either<'invalidToken', AccessTokenPayload>>((resolve) => {
            jwt.verify(token, this.pubKey, { algorithms: ['RS256'] }, function (err, payload) {
                if (!err) {
                    resolve(Right(payload as any));
                } else {
                    resolve(Left('invalidToken'));
                }
            });
        });
    }

    verifyRefreshToken(token: string) {
        return new Promise<Either<'invalidToken', RefreshTokenPayload>>((resolve) => {
            jwt.verify(token, this.pubKey, { algorithms: ['RS256'], audience: "refreshToken" }, function (err, payload) {
                if (!err && payload) {
                    resolve(Right(payload as any));
                } else {
                    resolve(Left('invalidToken'));
                }
            });
        });
    }

}









