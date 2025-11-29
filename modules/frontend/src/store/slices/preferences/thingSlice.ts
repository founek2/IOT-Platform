import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThingPreferences = { _id: string; order: number };
// Define a type for the slice state

const thingPreferencesAdapter = createEntityAdapter<ThingPreferences, string>({
    // Assume IDs are stored in a field other than `book.id`
    selectId: (thing) => thing._id,
});

export const thingPreferencesSlice = createSlice({
    name: 'things',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: thingPreferencesAdapter.getInitialState(),
    reducers: {
        addOne: thingPreferencesAdapter.addOne,
        addMany: thingPreferencesAdapter.addMany,
        setOne: thingPreferencesAdapter.setOne,
        setAll: thingPreferencesAdapter.setAll,
        removeOne: thingPreferencesAdapter.removeOne,
        updateOne: thingPreferencesAdapter.updateOne,
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
        builder.addCase('store/reset', (state) => thingPreferencesAdapter.getInitialState());
        // builder.addMatcher(devicesApi.endpoints.devices.matchFulfilled, (state, { payload }) => {
        //     const normalized = normalizeDevices(payload.docs);

        //     devicesAdapter.setAll(state, normalized.entities.devices as any);
        // });
    },
});

export const thingPreferencesReducerActions = thingPreferencesSlice.actions;
export const thingPreferencesSelectors = thingPreferencesAdapter.getSelectors();

export default thingPreferencesSlice.reducer;
