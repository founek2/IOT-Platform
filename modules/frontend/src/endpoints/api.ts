import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store/index.js';
import { logger } from "common/logger"
import internalStorage from '../services/internalStorage.js';
import parseJwt from 'common/utils/parseJwtToken';

const SECONDS_60 = 60;

// Create our baseQuery instance
const baseQuery = fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: async (headers, { getState }) => {
        // By default, if we have a token in the store, let's use that for authenticated requests
        const accessToken = internalStorage.getAccessToken()
        const authorization = (getState() as RootState).application.authorization;
        if (!accessToken || !authorization.loggedIn) return headers

        const expired = accessToken.expiresAt < Date.now() / 1000 + SECONDS_60;
        if (!expired) {
            headers.set('Authorization', `Bearer ${accessToken.token}`);
        } else {
            try {
                const res = await fetch("/api/auth/user/signIn/refresh", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ formData: { REFRESH_TOKEN: { token: authorization.refreshToken } } }),
                })
                if (res.ok) {
                    const body = await res.json()

                    headers.set('Authorization', `Bearer ${body.accessToken}`);

                    const tokenPayload = parseJwt(body.accessToken)
                    internalStorage.emit("new_access_token", { token: body.accessToken, expiresAt: tokenPayload.exp })
                } else {
                    const body = await res.json()

                    if (body.error === "disabledToken") {
                        internalStorage.emit("invalid_token", undefined)
                    }
                }


            } catch (err) {
                logger.error(err)
            }
        }

        return headers;
    },
});

// const baseQueryWithRetry = retry(baseQuery, { maxRetries: 1 });

/**
 * Create a base API to inject endpoints into elsewhere.
 * Components using this API should import from the injected site,
 * in order to get the appropriate types,
 * and to ensure that the file injecting the endpoints is loaded
 */
export const api = createApi({
    /**
     * A bare bones base query would just be `baseQuery: fetchBaseQuery({ baseUrl: '/' })`
     */
    baseQuery,
    /**
     * Tag types must be defined in the original API definition
     * for any tags that would be provided by injected endpoints
     */
    tagTypes: [
        'SignIn',
        "ActiveSignIn",
        'Devices',
        "DevicesAll",
        'AuthProviders',
        'UserAuthTypes',
        'UserNames',
        'History',
        'Users',
        'DiscoveredDevices',
        'AccessTokens',
        'NotificationConfig',
        'ThingNotifications',
        'Broker',
        'UserDashboard'
    ],
    /**
     * This api has endpoints injected in adjacent files,
     * which is why no endpoints are shown below.
     * If you want all endpoints defined in the same file, they could be included here instead
     */
    endpoints: () => ({}),
});

export const enhancedApi = api.enhanceEndpoints({
    endpoints: () => ({
        getPost: () => 'test',
    }),
});
