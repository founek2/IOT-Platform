import { Config } from '../config.js';
import { OAuthProvider } from 'common/models/interface/userInterface';
import { Maybe, Just, Nothing } from 'purify-ts/Maybe';
import { logger } from 'common/logger';
import fetch from 'node-fetch';

export interface AuthorizationSeznam {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    token_type: string; // bearer
    status: number; // 200
    messsage: string; // "ok"

    oauth_user_id: string;
    account_name: string; // email uživatele
}

export interface Authorization {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    token_type: string; // bearer

    oauth_user_id: string;
    email: string; // email uživatele
}

export interface RevokeBody {
    message: 'ok';
    status: number;
}

export interface RevokeErrorBody {
    message: string;
    error: string;
}

export class OAuthService {
    oauth: Config["oauth"]

    constructor(oauth: Config["oauth"]) {
        this.oauth = oauth
    }

    async requestAuthorization(
        code: string,
        redirectUri: string,
        provider: OAuthProvider
    ): Promise<Maybe<Authorization>> {
        try {
            const res = await fetch('https://login.szn.cz/api/v1/oauth/token', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: redirectUri,
                    client_secret: this.oauth.seznam.clientSecret,
                    client_id: this.oauth.seznam.clientId,
                }),
            });
            if (res.status !== 200) throw new Error('invalid status req ' + res.status);

            const body = (await res.json()) as AuthorizationSeznam;
            if (body.status !== 200) throw new Error('invalid status body ' + JSON.stringify(body));

            return Just<Authorization>({
                access_token: body.access_token,
                expires_in: body.expires_in,
                refresh_token: body.refresh_token,
                token_type: body.token_type,

                oauth_user_id: body.oauth_user_id,
                email: body.account_name,
            });
        } catch (err) {
            logger.error('requestAuthorization', err);
            return Nothing;
        }
    }

    async revokeToken(
        authToken: string,
        token: string,
        tokenType: 'refresh_token' | 'access_token',
        provider: OAuthProvider
    ) {
        try {
            const res = await fetch('https://login.szn.cz/api/v1/oauth/revoke', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'bearer ' + authToken,
                },
                body: JSON.stringify({
                    token_type_hint: tokenType,
                    token,
                }),
            });

            if (res.status !== 200) throw new Error('invalid status req ' + res.status);

            const body = (await res.json()) as RevokeBody;
            if (body.status !== 200) throw new Error('invalid status ' + JSON.stringify(body));

            return Just(body);
        } catch (err) {
            logger.error('revokeToken', err);
            return Nothing;
        }
    }
}
