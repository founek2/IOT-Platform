import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { IDevice } from 'common/src/models/interface/device';
import { devicesApi } from '../../../endpoints/devices';
import { normalizeDevices } from '../../../utils/normalizr';

export type Device = Omit<IDevice, 'things' | '_id'> & { _id: string; things: string[] };
// Define a type for the slice state

const devicesAdapter = createEntityAdapter<Device, string>({
    // Assume IDs are stored in a field other than `book.id`
    selectId: (device) => device._id,
    // Keep the "all IDs" array sorted based on book titles
    sortComparer: (a, b) => a.info.name.localeCompare(b.info.name),
});

export const devicesSlice = createSlice({
    name: 'devices',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: devicesAdapter.getInitialState(),
    reducers: {
        addOne: devicesAdapter.addOne,
        addMany: devicesAdapter.addMany,
        setOne: devicesAdapter.setOne,
        setAll: devicesAdapter.setAll,
        removeOne: devicesAdapter.removeOne,
        updateOne: devicesAdapter.updateOne,
    },
    extraReducers: (builder) => {
        builder.addCase('store/reset', (state) => devicesAdapter.getInitialState());
        builder.addMatcher(devicesApi.endpoints.devices.matchFulfilled, (state, { payload }) => {
            const normalized = normalizeDevices(payload.docs);

            devicesAdapter.setAll(state, normalized.entities.devices as any);
        });
    },
});

export const devicesReducerActions = devicesSlice.actions;
export const deviceSelectors = devicesAdapter.getSelectors();

export default devicesSlice.reducer;
