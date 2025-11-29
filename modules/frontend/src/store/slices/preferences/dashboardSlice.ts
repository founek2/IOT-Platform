import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { notEmpty } from 'common/src/utils/notEmpty';
import { byPreferences } from '../../../utils/sort';

export type PropertyPreferences = { _id: string; thingId: string, order: number };
// Define a type for the slice state

const propertyPreferencesAdapter = createEntityAdapter<PropertyPreferences, string>({
    // Assume IDs are stored in a field other than `book.id`
    selectId: (property) => property._id,
});

export const propertyPreferencesSlice = createSlice({
    name: 'dashboard',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: propertyPreferencesAdapter.getInitialState(),
    reducers: {
        addOne: propertyPreferencesAdapter.addOne,
        addMany: propertyPreferencesAdapter.addMany,
        setOne: propertyPreferencesAdapter.setOne,
        setAll: propertyPreferencesAdapter.setAll,
        removeOne: propertyPreferencesAdapter.removeOne,
        updateOne: propertyPreferencesAdapter.updateOne,
        resetOrder: (state, action: PayloadAction<void>) => {
            const preferences = Object.values(state.entities).filter(notEmpty);
            const ordered = preferences.map(p => ({ ...p, id: p._id })).sort(byPreferences(state.entities))
            ordered.forEach((order, idx) => {
                state.entities[order.id]!.order = idx;
            });
        },
        swapOrderFor: (state, action: PayloadAction<[string, string]>) => {
            const { order } = state.entities[action.payload[0]]!;
            state.entities[action.payload[0]]!.order = state.entities[action.payload[1]]!.order;
            state.entities[action.payload[1]]!.order = order;
        },
    },
    extraReducers: (builder) => {
        builder.addCase('store/reset', (state) => propertyPreferencesAdapter.getInitialState());
        // builder.addMatcher(devicesApi.endpoints.devices.matchFulfilled, (state, { payload }) => {
        //     const normalized = normalizeDevices(payload.docs);

        //     devicesAdapter.setAll(state, normalized.entities.devices as any);
        // });
    },
});

export const propertyPreferencesReducerActions = propertyPreferencesSlice.actions;
export const propertyPreferencesSelectors = propertyPreferencesAdapter.getSelectors();

export default propertyPreferencesSlice.reducer;
