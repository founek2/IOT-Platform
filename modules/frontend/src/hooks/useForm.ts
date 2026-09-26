import React, { useEffect, useState } from 'react';
import { useStore } from 'react-redux';
import { useAppDispatch, useAppStore } from '.';
import { formsDataActions } from '../store/slices/formDataActions.js';
import { Paths } from '../types';

export function useForm<T = FormData>(formName: string, options?: { resetOnUnmount: boolean }) {
    const dispatch = useAppDispatch();
    const store = useAppStore();

    const validateForm = React.useCallback(
        () => dispatch(formsDataActions.validateForm(formName)) as { data: T; valid: boolean },
        [dispatch]
    );
    const validateField = React.useCallback(
        (fieldPath: Paths<T>) => dispatch(formsDataActions.validateField(`${formName}.${fieldPath}`, true)),
        [dispatch]
    );
    const setFieldValue = React.useCallback(
        (value: any, fieldPath: Paths<T>) =>
            dispatch(formsDataActions.setFormField({ deepPath: `${formName}.${fieldPath.join('.')}`, value })),
        [dispatch]
    );
    const setFormData = React.useCallback(
        (formData: T) => dispatch(formsDataActions.setFormData({ formName: formName, data: formData } as any)),
        [dispatch]
    );
    const getFormData = React.useCallback(
        () => store.getState().formsData[formName] as unknown as T,
        [dispatch]
    );
    const resetForm = React.useCallback(() => {
        dispatch(formsDataActions.removeForm(formName));
    }, [dispatch]);

    useEffect(() => {
        return () => {
            if (options?.resetOnUnmount) resetForm()
        }
    }, [options?.resetOnUnmount])

    return {
        validateField,
        validateForm,
        setFieldValue,
        resetForm,
        setFormData,
        getFormData,
    };
}
