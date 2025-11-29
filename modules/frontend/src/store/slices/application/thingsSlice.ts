import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IThing } from 'common/src/models/interface/thing';
import { devicesApi } from '../../../endpoints/devices';
import { thingsApi } from '../../../endpoints/thing';
import { normalizeDevices } from '../../../utils/normalizr';

export interface PropertyState {
    value?: string | number | boolean;
    timestamp: string;
    inTransition?: boolean
}

export type Thing = Omit<IThing, '_id' | 'state'> & {
    _id: string;
    deviceId: string;
    state?: Record<string, PropertyState | undefined>;
};

const thingsAdapter = createEntityAdapter<Thing, string>({
    selectId: (thing) => thing._id,
    sortComparer: (a, b) => a.config.name.localeCompare(b.config.name),
});

export const thingsSlice = createSlice({
    name: 'things',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: thingsAdapter.getInitialState(),
    reducers: {
        addOne: thingsAdapter.addOne,
        addMany: thingsAdapter.addMany,
        setAll: thingsAdapter.setAll,
        removeOne: thingsAdapter.removeOne,
        updateOne: thingsAdapter.updateOne,
        updateOneState: function (
            state,
            action: PayloadAction<{ id: string; changes: Record<string, Partial<PropertyState>> }>
        ) {
            const {
                payload: { changes, id },
            } = action;

            const thing = state.entities[id];
            if (thing && changes) {
                if (!thing.state) {
                    thing.state = {};
                }

                Object.keys(changes).forEach((propertyId) => {
                    const change = changes[propertyId];
                    if (!change) return;

                    if (!thing.state![propertyId]) thing.state![propertyId] = {} as any;

                    thing.state![propertyId]! = { ...thing.state![propertyId]!, inTransition: false, ...changes[propertyId] };
                });
            }
        },
        swapPropertyOrderFor: (state, action: PayloadAction<[Thing["_id"], string, string]>) => {
            const [entityId, propA, propB] = action.payload;
            const properties = state.entities[entityId]?.config.properties
            if (!properties) return

            const idA = properties.findIndex(p => p._id === propA)
            const idB = properties.findIndex(p => p._id === propB)
            if (idA === -1 || idB === -1) return

            const tmp = properties[idA];
            properties[idA] = properties[idB]
            properties[idB] = tmp;
        },
    },
    extraReducers: (builder) => {
        builder.addCase('store/reset', () => thingsAdapter.getInitialState());
        builder.addMatcher(devicesApi.endpoints.devices.matchFulfilled, (state, { payload }) => {
            const normalized = normalizeDevices(payload.docs);

            thingsAdapter.setAll(state, normalized.entities.things as any);
        });
        builder.addMatcher(thingsApi.endpoints.updateThingState.matchPending, (state, { payload, meta }) => {
            const { thingId, value, propertyId } = meta.arg.originalArgs;

            thingsSlice.caseReducers.updateOneState(state, {
                payload: { id: thingId, changes: { [propertyId]: { value, inTransition: true } } },
                type: 'things/updateOneState',
            });
        });
    },
});

export const thingsReducerActions = thingsSlice.actions;
export const thingSelectors = thingsAdapter.getSelectors();

export default thingsSlice.reducer;
