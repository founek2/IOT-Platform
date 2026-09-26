import ErrorMessages from 'common/localization/error';
import { logger } from 'common/logger';
import { getFieldVal, getFormData, getFormsData } from 'common/utils/getters';
import { checkValid, validateField, validateForm, validateRegisteredFields } from 'common/validations';
import { AppThunk } from '../../types';
import { formsDataReducerActions } from './formDataSlice.js';
import { notificationActions } from './notificationSlice.js';
import fieldDescriptors from 'common/fieldDescriptors';
import { FormData } from 'common/validations/types';

export const formsDataActions = {
    ...formsDataReducerActions,
    validateField(deepPath: string, ignorePristine = false): AppThunk<{ value: any; valid: boolean }> {
        return function (dispatch, getState) {
            logger.info('VALIDATE_FIELD:', deepPath);
            const fieldState = validateField(
                deepPath,
                { formsData: getFormsData(getState()), fieldDescriptors },
                ignorePristine
            );
            dispatch(formsDataActions.updateRegisteredField({ deepPath, value: fieldState }));
            return { value: getFieldVal(deepPath)(getState()), valid: fieldState.valid };
        };
    },

    // : AppThunk<ReturnType<typeof checkValid>>
    validateForm(formName: string, ignoreRequired = false): AppThunk<{ data?: FormData; valid: boolean }> {
        return function (dispatch, getState) {
            logger.info('VALIDATE_FORM:', formName);

            // dispatch(formsDataActions.setFormData({ formName, data: getFormData(formName)(getState()) }));
            const fieldStates = validateForm(
                formName,
                { formsData: getFormsData(getState()), fieldDescriptors },
                ignoreRequired
            );

            dispatch(formsDataActions.updateRegisteredFields(fieldStates));

            const result = checkValid(fieldStates[formName]);
            if (!result.valid) {
                dispatch(
                    notificationActions.add({
                        message: ErrorMessages.getMessage('validationFailed'),
                        options: { variant: 'error' },
                    })
                );
            }

            return { data: getFormData(formName)(getState()), valid: result.valid };
        };
    },

    validateRegisteredFields(formName: string, ignoreRequired = false): AppThunk<boolean> {
        return function (dispatch, getState) {
            logger.info('VALIDATE_REGISTERED_FIELDS:', formName);

            // @ts-ignore
            dispatch(formsDataActions.setFormData({ formName, data: getFormData(formName)(getState()) }));
            const fieldStates = validateRegisteredFields(
                formName,
                { formsData: getFormsData(getState()), fieldDescriptors },
                ignoreRequired
            );

            dispatch(formsDataActions.updateRegisteredFields(fieldStates));

            const result = checkValid(fieldStates[formName]);
            if (!result.valid) {
                dispatch(
                    notificationActions.add({
                        message: ErrorMessages.getMessage('validationFailed'),
                        options: { variant: 'error' },
                    })
                );
            }
            return result.valid;
        };
    },
};
