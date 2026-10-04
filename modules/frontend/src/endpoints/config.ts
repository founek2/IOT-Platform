import { api } from './api.js';

export const devicesApi = api.injectEndpoints({
    endpoints: (build) => ({
        vapidKey: build.query<string, undefined>({
            query: () => `main/config/notification`,
            providesTags: ['NotificationConfig'],
            transformResponse: (body: { vapidPublicKey: string }) => body.vapidPublicKey
        }),
        webMqttUrl: build.query<string | null, void>({
            query: () => `main/config/mqtt`,
            transformResponse: (body: { webMqttUrl: string | null }) => body.webMqttUrl
        }),
    }),
});

export const { useVapidKeyQuery, useWebMqttUrlQuery } = devicesApi;
