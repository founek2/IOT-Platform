import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { IDevice } from 'common/models/interface/device';
import { devicesApi } from '../../../endpoints/devices.js';
import { User } from '../../../endpoints/signIn.js';
import { usersApi } from '../../../endpoints/users.js';
import { normalizeDevices } from '../../../utils/normalizr.js';


const usersAdapter = createEntityAdapter<User, string>({
    // Assume IDs are stored in a field other than `book.id`
    selectId: (user) => user._id,
});

export const usersSlice = createSlice({
    name: 'users',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: usersAdapter.getInitialState(),
    reducers: {
        addOne: usersAdapter.addOne,
        addMany: usersAdapter.addMany,
        setOne: usersAdapter.setOne,
        setAll: usersAdapter.setAll,
        removeOne: usersAdapter.removeOne,
        updateOne: usersAdapter.updateOne,
    },
    extraReducers: (builder) => {
        builder.addCase('store/reset', (state) => usersAdapter.getInitialState());
        builder.addMatcher(usersApi.endpoints.users.matchFulfilled, (state, { payload }) => {
            usersAdapter.setAll(state, payload);
        });
    },
});

export const usersReducerActions = usersSlice.actions;
export const usersSelectors = usersAdapter.getSelectors();

export default usersSlice.reducer;
