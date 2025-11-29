import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DevicePreferences = { _id: string; order: number };
// Define a type for the slice state

const devicePreferencesAdapter = createEntityAdapter<DevicePreferences, string>({
    // Assume IDs are stored in a field other than `book.id`
    selectId: (thing) => thing._id,
});

export const devicePreferencesSlice = createSlice({
    name: 'device',
    initialState: devicePreferencesAdapter.getInitialState(),
    reducers: {
        addOne: devicePreferencesAdapter.addOne,
        addMany: devicePreferencesAdapter.addMany,
        setOne: devicePreferencesAdapter.setOne,
        setAll: devicePreferencesAdapter.setAll,
        removeOne: devicePreferencesAdapter.removeOne,
        updateOne: devicePreferencesAdapter.updateOne,
        updateMany: devicePreferencesAdapter.updateMany,
        resetOrderFor: (state, action: PayloadAction<string[]>) => {
            action.payload.forEach((id, idx) => {
                if (!state.entities[id]) {
                    state.ids.push(id);
                    state.entities[id] = { _id: id, order: idx };
                } else state.entities[id]!.order = idx;
            });
        },
        swapOrderFor: (state, action: PayloadAction<[string, string]>) => {
            const { order } = state.entities[action.payload[0]]!;
            state.entities[action.payload[0]]!.order = state.entities[action.payload[1]]!.order;
            state.entities[action.payload[1]]!.order = order;
        },
    },
    extraReducers: (builder) => {
        builder.addCase('store/reset', (state) => devicePreferencesAdapter.getInitialState());
        // builder.addMatcher(devicesApi.endpoints.devices.matchFulfilled, (state, { payload }) => {
        //     const normalized = normalizeDevices(payload.docs);

        //     devicesAdapter.setAll(state, normalized.entities.devices as any);
        // });
    },
});

export const devicePreferencesReducerActions = devicePreferencesSlice.actions;
export const devicePreferencesSelectors = devicePreferencesAdapter.getSelectors();

export default devicePreferencesSlice.reducer;
