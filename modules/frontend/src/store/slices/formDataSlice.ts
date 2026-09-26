import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dissocPath from 'ramda/src/dissocPath';
import mergeDeepLeft from 'ramda/src/mergeDeepLeft';
import { FieldState, FormsData } from 'common/validations/types';
import setInPath from 'common/utils/setInPath';
import getInPath from 'common/utils/getInPath';
import { EditUserFormData } from '../../endpoints/users.js';
import { EditDeviceFormData } from '../../endpoints/devices.js';

// Define the initial state using that type
const initialState: FormsData = { registeredFields: {} };

type SetFormData =
    | { formName: 'EDIT_USER'; data: EditUserFormData }
    | { formName: 'EDIT_DEVICE'; data: EditDeviceFormData }
    | { formName: 'EDIT_ACCESS_TOKEN'; data: any }
    | { formName: 'ADD_ACCESS_TOKEN'; data: any };

export const formsDataSlice = createSlice({
    name: 'formsData',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        toDefault: () => initialState,
        setFormData: (state, action: PayloadAction<SetFormData>) => {
            const { formName, data } = action.payload;
            return setInPath(formName, data, state);
        },
        updateFormData: (state, action: PayloadAction<{ formName: string; data: any }>) => {
            const { formName, data } = action.payload;
            return mergeDeepLeft({ [formName]: data }, state);
        },
        removeForm: (state, action: PayloadAction<string>) => {
            delete state[action.payload];
        },
        registerField: (state, action: PayloadAction<string>) => {
            return setInPath('registeredFields.' + action.payload, { valid: true, pristine: true }, state);
        },
        unregisterField: (state, action: PayloadAction<string>) => {
            return dissocPath(['registeredFields', ...action.payload.split('.')], state);
        },
        updateRegisteredField: (state, action: PayloadAction<{ deepPath: string; value: Partial<FieldState> }>) => {
            const { deepPath, value } = action.payload;
            const fieldState: FieldState = getInPath('registeredFields.' + deepPath, state);

            if (value.errorMessages !== undefined) fieldState.errorMessages = value.errorMessages;
            if (value.pristine !== undefined) fieldState.pristine = value.pristine;
            if (value.valid !== undefined) fieldState.valid = value.valid;
        },
        updateRegisteredFields: (state, action: PayloadAction<any>) => {
            state.registeredFields = mergeDeepLeft(action.payload, state.registeredFields);
        },
        setFormField: (state, action: PayloadAction<{ deepPath: string; value: any }>) => {
            const { deepPath, value } = action.payload;
            return setInPath(deepPath, value, state);
        },
    },
});

export const formsDataReducerActions = { ...formsDataSlice.actions };

export default formsDataSlice.reducer;
