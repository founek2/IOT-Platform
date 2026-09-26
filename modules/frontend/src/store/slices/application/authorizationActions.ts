import { api } from '../../../endpoints/api.js';
import internalStorage from '../../../services/internalStorage.js';
import { AppThunk } from '../../../types';
import { authorizationReducerActions } from './authorizationSlice.js';

const ACTION_RESET_STORE = 'store/reset';

export const authorizationActions = {
    ...authorizationReducerActions,

    signOut(): AppThunk {
        return function (dispatch, getState) {
            dispatch({ type: ACTION_RESET_STORE });
            internalStorage.deleteAccessToken()
            dispatch(api.util.resetApiState());
        };
    },
};
