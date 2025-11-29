import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { Discovery, discoveryApi } from '../../../endpoints/discovery';

// Define a type for the slice state

const discoveryAdapter = createEntityAdapter<Discovery, string>({
    // Assume IDs are stored in a field other than `book.id`
    selectId: (device) => device._id,
    // Keep the "all IDs" array sorted based on book titles
    sortComparer: (a, b) => a.name ? a.name.localeCompare(b.name || "") : 0,
});

export const discoverySlice = createSlice({
    name: 'devices',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: discoveryAdapter.getInitialState(),
    reducers: {
        addOne: discoveryAdapter.addOne,
        addMany: discoveryAdapter.addMany,
        setOne: discoveryAdapter.setOne,
        setAll: discoveryAdapter.setAll,
        removeOne: discoveryAdapter.removeOne,
        updateOne: discoveryAdapter.updateOne,
        upsertOne: discoveryAdapter.upsertOne,
    },
    extraReducers: (builder) => {
        builder.addCase('store/reset', (state) => discoveryAdapter.getInitialState());
        builder.addMatcher(discoveryApi.endpoints.discoveredDevices.matchFulfilled, (state, { payload }) => {
            discoveryAdapter.setAll(state, payload);
        });
        builder.addMatcher(discoveryApi.endpoints.createDevice.matchFulfilled, (state, { meta }) => {
            const { deviceID } = meta.arg.originalArgs;
            discoveryAdapter.removeOne(state, deviceID);
        });
    },
});

export const discoveryReducerActions = discoverySlice.actions;
export const discoverySelectors = discoveryAdapter.getSelectors();

export default discoverySlice.reducer;
