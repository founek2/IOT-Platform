import { IDiscovery, IDiscoveryThing } from 'common/models/interface/discovery';
import { api } from './api.js';

export type Discovery = Omit<IDiscovery, "_id" | "name" | "things"> & { _id: string, name?: string, things: { [nodeId: string]: IDiscoveryThing } };

export interface CreateDeviceForm {
    info: {
        name: string;
        location: {
            building: string;
            room: string;
        };
    };
}

export const discoveryApi = api.injectEndpoints({
    endpoints: (build) => ({
        discoveredDevices: build.query<Discovery[], undefined>({
            query: () => 'main/discovery',
            providesTags: ['DiscoveredDevices'],
            transformResponse: (response: { docs: Discovery[] }) => response.docs,
        }),
        createDevice: build.mutation<undefined, { deviceID: string; data: CreateDeviceForm }>({
            query: ({ deviceID, data }) => ({
                url: `main/discovery/${deviceID}`,
                method: 'POST',
                body: { formData: { CREATE_DEVICE: data } },
            }),
            invalidatesTags: ['Devices'],
        }),
        deleteDiscoveryDevice: build.mutation<undefined, { deviceID: string }>({
            query: ({ deviceID }) => ({
                url: `main/discovery/${deviceID}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['DiscoveredDevices'],
        }),
    }),
});

export const { useDiscoveredDevicesQuery, useCreateDeviceMutation, useDeleteDiscoveryDeviceMutation } = discoveryApi;
