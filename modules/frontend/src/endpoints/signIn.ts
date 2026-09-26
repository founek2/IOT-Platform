import { AuthType } from 'common/constants';
import { IRefreshToken, IUser } from 'common/models/interface/userInterface';
import { buildRedirectUri } from '../utils/redirectUri.js';
import { api } from './api.js';

export type User = Omit<IUser, '_id'> & { _id: string };

export interface SignInResponse {
    accessToken: string;
    refreshToken: string;
    token: string;
    user: User;
}

export interface AuthTypesResponse {
    authTypes: AuthType[];
}

export type AuthProvider = {
    provider: string;
    authUrl: string;
    iconUrl: string;
};

export interface ActiveSignInResponse {
    activeRefreshTokens: {
        _id: string,
        validTo?: string,
        createdAt: string,
        userAgent?: {
            browser: { name: string, version: string },
            engine: { name: string, version: string },
            os: { name: string, version: string },
            device: { vendor: string, model: string }
        }
    }[]
}

export const signInApi = api.injectEndpoints({
    endpoints: (build) => ({
        signIn: build.mutation<SignInResponse, { userName: string; password: string }>({
            query(body) {
                return {
                    url: `auth/user/signIn`,
                    method: 'POST',
                    body: { formData: { LOGIN: { ...body, authType: AuthType.passwd } } },
                };
            },
            invalidatesTags: ['SignIn'],
        }),
        signInRefresh: build.mutation<Pick<SignInResponse, "accessToken">, { token: string }>({
            query(body) {
                return {
                    url: `auth/user/signIn/refresh`,
                    method: 'POST',
                    body: { formData: { REFRESH_TOKEN: { token: body.token } } },
                };
            },
        }),
        signInOauth: build.mutation<SignInResponse, { code: string; redirectUri: string }>({
            query(body) {
                return {
                    url: `auth/user/signIn`,
                    method: 'POST',
                    body: { formData: { AUTHORIZATION: body } },
                };
            },
            invalidatesTags: ['SignIn'],
        }),
        getAuthTypes: build.query<AuthTypesResponse, string>({
            query: (userName) => `main/user/${userName}?attribute=authType`,
            providesTags: ['UserAuthTypes'],
        }),
        getActiveSignIn: build.query<ActiveSignInResponse["activeRefreshTokens"], void>({
            query: () => `auth/user/signIn/active`,
            providesTags: ['ActiveSignIn'],
            transformResponse: (body: ActiveSignInResponse) => {
                console.log("body", body)
                return body.activeRefreshTokens
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            }
        }),
        getAuthProviders: build.query<{ oauth: AuthProvider[] }, void>({
            query: () => `/auth/user/signIn`,
            providesTags: ['AuthProviders'],
            transformResponse: (res: { oauth: AuthProvider[] }) => {
                return {
                    oauth: res.oauth.map((obj) => ({
                        ...obj,
                        authUrl: obj.authUrl + `&redirect_uri=${buildRedirectUri()}`,
                    })),
                };
            },
        }),
        removeActiveSignIn: build.mutation<void, string>({
            query(id) {
                return {
                    url: `auth/user/signIn/${id}`,
                    method: 'DELETE',
                };
            },
            invalidatesTags: ["ActiveSignIn"]
        }),
    }),
});

export const { useSignInMutation, useLazyGetAuthTypesQuery, useGetAuthProvidersQuery, useSignInOauthMutation, useGetActiveSignInQuery, useRemoveActiveSignInMutation } =
    signInApi;
