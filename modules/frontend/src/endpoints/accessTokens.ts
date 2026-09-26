import { IAccessToken, Permission } from 'common/models/interface/userInterface';
import { api } from './api.js';

export type AccessToken = IAccessToken & { _id: string };
export interface NewAccessTokenData {
    name: string
    permissions: Permission[]
}

export const accessTokensApi = api.injectEndpoints({
    endpoints: (build) => ({
        createAccessToken: build.mutation<{}, { userID: string; data: NewAccessTokenData }>({
            query: ({ userID, data }) => ({
                url: `main/user/${userID}/accessToken`,
                method: 'POST',
                body: { formData: { ADD_ACCESS_TOKEN: data } },
            }),
            invalidatesTags: ['AccessTokens'],
        }),
        updateAccessToken: build.mutation<{}, { userID: string, tokenID: string; data: NewAccessTokenData }>({
            query: ({ userID, tokenID, data }) => ({
                url: `main/user/${userID}/accessToken/${tokenID}`,
                method: 'PATCH',
                body: { formData: { EDIT_ACCESS_TOKEN: data } },
            }),
            invalidatesTags: ['AccessTokens'],
        }),
        deleteAccessToken: build.mutation<undefined, { userID: string, tokenID: string; }>({
            query: ({ userID, tokenID }) => ({
                url: `main/user/${userID}/accessToken/${tokenID}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AccessTokens'],
        }),
        accessTokens: build.query<AccessToken[], { userID: string; }>({
            query: ({ userID }) => `main/user/${userID}/accessToken`,
            transformResponse: (data: { docs: AccessToken[] }) => data.docs,
            providesTags: ['AccessTokens'],
        }),
    }),
});

export const { useAccessTokensQuery, useCreateAccessTokenMutation, useDeleteAccessTokenMutation, useUpdateAccessTokenMutation } = accessTokensApi;
