import { ActionTypes } from '../../../constants/redux';
import { getFormData, getToken } from '../../../utils/getters';
import {
    create as createUserApi,
    getUsers as fetchUsers,
    deleteUser as deleteUserApi,
    updateUser as updateUserApi,
} from '../../../api/userApi';
import { baseLogger } from '../../../logger';
import { usersReducerActions } from '../../reducers/application/users';
import { AppThunk } from 'framework-ui/src/types';
import { formsDataActions } from '../formsData';

export const usersActions = {
    ...usersReducerActions,

    fetchAll(): AppThunk<Promise<boolean>> {
        return function (dispatch, getState) {
            return fetchUsers(
                {
                    token: getToken(getState()),
                    onSuccess: (json: any) => dispatch(usersActions.set(json.docs)),
                },
                dispatch
            );
        };
    },

    create(): AppThunk<Promise<boolean>> {
        return async function (dispatch, getState) {
            const USER = 'USER';
            const result = dispatch(formsDataActions.validateForm(USER));
            if (result.valid) {
                const state = getState();
                const formData = getFormData(USER)(state);
                return createUserApi(
                    {
                        body: { formsData: { [USER]: formData } },
                        token: getToken(state),
                        onSuccess: (json: any) => {
                            dispatch(usersActions.add(json.user));
                            dispatch(formsDataActions.resetForm(USER));
                        },
                    },
                    dispatch
                );
            }

            return false;
        };
    },

    updateUser(id: any): AppThunk<Promise<boolean>> {
        return async function (dispatch, getState) {
            const EDIT_USER = 'EDIT_USER';
            baseLogger(EDIT_USER);

            const result = dispatch(formsDataActions.validateForm(EDIT_USER));
            const formData = getFormData(EDIT_USER)(getState());
            if (result.valid) {
                return updateUserApi(
                    {
                        token: getToken(getState()),
                        body: { formData: { [EDIT_USER]: formData } },
                        id,
                        onSuccess: () => {
                            dispatch(usersActions.updateMultiple([formData as any]));
                        },
                    },
                    dispatch
                );
            }

            return false;
        };
    },

    deleteUsers(): AppThunk<Promise<boolean>> {
        return async function (dispatch, getState) {
            const USER_MANAGEMENT = 'USER_MANAGEMENT';
            const result = dispatch(formsDataActions.validateForm(USER_MANAGEMENT));
            if (result.valid) {
                const formData: any = getFormData(USER_MANAGEMENT)(getState());
                formData.selected.map((id: any) => {
                    return deleteUserApi(
                        {
                            token: getToken(getState()),
                            id,
                            onSuccess: () => dispatch(usersActions.remove(id)),
                        },
                        dispatch
                    );
                });
            }

            return false;
        };
    },
};