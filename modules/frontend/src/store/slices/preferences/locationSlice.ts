import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit';

export type LocationPreferences = { _id: string; order: number };
// Define a type for the slice state

const locationreferencesAdapter = createEntityAdapter<LocationPreferences, string>({
    // Assume IDs are stored in a field other than `book.id`
    selectId: (thing) => thing._id,
});

export const locationPreferencesSlice = createSlice({
    name: 'locations',
    initialState: locationreferencesAdapter.getInitialState(),
    reducers: {
        addOne: locationreferencesAdapter.addOne,
        addMany: locationreferencesAdapter.addMany,
        setOne: locationreferencesAdapter.setOne,
        setAll: locationreferencesAdapter.setAll,
        removeOne: locationreferencesAdapter.removeOne,
        updateOne: locationreferencesAdapter.updateOne,
        updateMany: locationreferencesAdapter.updateMany,
        resetOrderFor: (state, action: PayloadAction<string[]>) => {
            action.payload.forEach((id, idx) => {
                if (!state.entities[id]) {
                    state.ids.push(id);
                    state.entities[id] = { _id: id, order: idx };

                    if (!id.includes('/')) console.log('id', id);
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
        builder.addCase('store/reset', (state) => locationreferencesAdapter.getInitialState());
        // builder.addMatcher(devicesApi.endpoints.devices.matchFulfilled, (state, { payload }) => {
        //     const normalized = normalizeDevices(payload.docs);

        //     devicesAdapter.setAll(state, normalized.entities.devices as any);
        // });
    },
});

export const locationPreferencesReducerActions = locationPreferencesSlice.actions;
export const locationPreferencesSelectors = locationreferencesAdapter.getSelectors();

export default locationPreferencesSlice.reducer;
