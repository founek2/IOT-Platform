import { IAccessToken, IUser } from 'common/lib/models/interface/userInterface';
import { baseLogger } from 'framework-ui/lib/logger';
import { formsDataActions } from 'framework-ui/lib/redux/actions/formsData';
import { getFormData, getToken } from 'framework-ui/lib/utils/getters';
import { AppThunk } from 'frontend/src/types';
import {
    createAccessToken as createAccessTokenApi,
    deleteAccessToken as deleteAccessTokenApi,
    fetchAccessToken as fetchAccessTokenApi,
    updateAccessToken as updateAccessTokenApi,
} from '../../api/accessToken';
import { accessTokensReducerActions } from '../reducers/accessTokens';

export const accessTokensActions = {
    ...accessTokensReducerActions,

    create(userId: IUser['_id']): AppThunk {
        return function (dispatch, getState) {
            const ADD_ACCESS_TOKEN = 'ADD_ACCESS_TOKEN';
            baseLogger(ADD_ACCESS_TOKEN);

            const result = dispatch(formsDataActions.validateForm(ADD_ACCESS_TOKEN));
            const formData = getFormData(ADD_ACCESS_TOKEN)(getState());
            if (result.valid) {
                return createAccessTokenApi(
                    {
                        userId,
                        token: getToken(getState()),
                        body: { formData: { [ADD_ACCESS_TOKEN]: formData } },
                        onSuccess: (json: { doc: IAccessToken }) => {
                            dispatch(accessTokensActions.add(json.doc));
                        },
                    },
                    dispatch
                );
            }
        };
    },

    updateToken(tokenId: IAccessToken['_id'], userId: IUser['_id']): AppThunk {
        return function (dispatch, getState) {
            const EDIT_ACCESS_TOKEN = 'EDIT_ACCESS_TOKEN';
            baseLogger(EDIT_ACCESS_TOKEN);

            const result = dispatch(formsDataActions.validateForm(EDIT_ACCESS_TOKEN));
            const formData: any = getFormData(EDIT_ACCESS_TOKEN)(getState());
            if (result.valid) {
                return updateAccessTokenApi(
                    {
                        tokenId,
                        userId,
                        token: getToken(getState()),
                        body: { formData: { [EDIT_ACCESS_TOKEN]: formData } },
                        onSuccess: () => {
                            dispatch(accessTokensActions.update({ _id: tokenId, ...formData }));
                        },
                    },
                    dispatch
                );
            }
        };
    },

    fetch(userId: IUser['_id']): AppThunk {
        return function (dispatch, getState) {
            baseLogger('FETCH_ACCIESS_TOKENS');

            return fetchAccessTokenApi(
                {
                    userId,
                    token: getToken(getState()),
                    onSuccess: (json: { docs: IAccessToken[] }) => {
                        dispatch(accessTokensActions.set(json.docs));
                    },
                },
                dispatch
            );
        };
    },

    delete(tokenId: IAccessToken['_id'], userId: IUser['_id']): AppThunk {
        return function (dispatch, getState) {
            baseLogger('DELETE_ACCESS_TOKEN');

            return deleteAccessTokenApi(
                {
                    tokenId,
                    userId,
                    token: getToken(getState()),
                    onSuccess: () => {
                        dispatch(accessTokensActions.remove(tokenId));
                    },
                },
                dispatch
            );
        };
    },
};