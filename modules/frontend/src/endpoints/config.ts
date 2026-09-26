import { IDevice } from 'common/models/interface/device';
import { Measurement } from 'common/types';
import { Device } from '../store/slices/application/devicesSlice.js';
import { api } from './api.js';

export const devicesApi = api.injectEndpoints({
    endpoints: (build) => ({
        vapidKey: build.query<string, undefined>({
            query: () => `main/config/notification`,
            providesTags: ['NotificationConfig'],
            transformResponse: (body: { vapidPublicKey: string }) => body.vapidPublicKey
        }),
    }),
});

export const { useVapidKeyQuery } = devicesApi;
