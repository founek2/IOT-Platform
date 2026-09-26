import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { signInApi, User } from '../../../endpoints/signIn.js';
import { usersApi } from '../../../endpoints/users.js';
import parseJwt from "common/utils/parseJwtToken"
import internalStorage from '../../../services/internalStorage.js';

export interface AuthorizationState {
    loggedIn: boolean;
    refreshToken: string;
    refreshTokenExpiresAt: number;
    currentUser: User | null;
}

const initialState: AuthorizationState = {
    loggedIn: false,
    refreshToken: '',
    refreshTokenExpiresAt: 0,
    currentUser: null,
};

export const authorizationSlice = createSlice({
    name: 'authorization',
    initialState,
    reducers: {
        setCurrentUser: (state, action: PayloadAction<User>) => {
            state.loggedIn = action.payload ? true : false;
            state.currentUser = action.payload;
        },
        setAccessToken: (state, action: PayloadAction<{ token: string; expiresAt: number }>) => {
            internalStorage.emit("new_access_token", action.payload)
        },
        setRefreshToken: (state, action: PayloadAction<{ token: string; expiresAt: number }>) => {
            state.refreshToken = action.payload.token;
            state.refreshTokenExpiresAt = action.payload.expiresAt;
        },
    },
    extraReducers: (builder) => {
        builder.addCase('store/reset', (state) => {
            internalStorage.deleteAccessToken()

            return initialState
        });
        builder.addMatcher(signInApi.endpoints.signIn.matchFulfilled, (state, { payload }) => {
            const tokenPayload = parseJwt(payload.accessToken)

            state.loggedIn = true;
            state.refreshToken = payload.refreshToken;
            state.currentUser = payload.user;

            internalStorage.emit("new_access_token", { token: payload.accessToken, expiresAt: tokenPayload.exp })
        });
        builder.addMatcher(signInApi.endpoints.signInRefresh.matchFulfilled, (state, { payload }) => {
            const tokenPayload = parseJwt(payload.accessToken)

            internalStorage.emit("new_access_token", { token: payload.accessToken, expiresAt: tokenPayload.exp })
        });
        builder.addMatcher(signInApi.endpoints.signInOauth.matchFulfilled, (state, { payload }) => {
            const tokenPayload = parseJwt(payload.accessToken)

            state.loggedIn = true;
            state.refreshToken = payload.refreshToken;
            state.currentUser = payload.user;

            internalStorage.emit("new_access_token", { token: payload.accessToken, expiresAt: tokenPayload.exp })
        });
        builder.addMatcher(usersApi.endpoints.registerAndSignIn.matchFulfilled, (state, { payload }) => {
            const tokenPayload = parseJwt(payload.accessToken)

            state.loggedIn = true;
            state.refreshToken = payload.refreshToken;
            state.currentUser = payload.user;

            internalStorage.emit("new_access_token", { token: payload.accessToken, expiresAt: tokenPayload.exp })
        });
        builder.addMatcher(usersApi.endpoints.users.matchFulfilled, (state, { payload }) => {
            const currentUser = payload.find(user => user._id === state.currentUser?._id)
            if (currentUser) {
                state.currentUser = currentUser
            }
        });
    },
});

export const authorizationReducerActions = authorizationSlice.actions;

export default authorizationSlice.reducer;
