import {
    FieldDescriptor,
    FieldDescriptors,
    FieldState,
    FormsData,
    RegisteredFields,
} from '../validations/types.js';
import { compose, curry, o, prop } from 'ramda';
import getInPath from './getInPath.js';

type RootState = { formsData: FormsData; fieldDescriptors: FieldDescriptors };

export const getFormsData = (state: Pick<RootState, 'formsData'>) => state.formsData;

export const getFieldDescriptors = (state: Pick<RootState, 'fieldDescriptors'>) => state.fieldDescriptors;

export const getFieldDescriptor = (deepPath: string) => (state: Pick<RootState, 'fieldDescriptors'>) =>
    o((descriptors) => {
        if (deepPath.match(/\.\d+$/)) deepPath = deepPath.replace(/\.\d+$/, '[]');
        return getInPath<[any], [any], FieldDescriptor | undefined>(deepPath)(descriptors);
    }, getFieldDescriptors)(state);

export const getRegisteredFields = o<Pick<RootState, 'formsData'>, FormsData, RegisteredFields>(
    prop('registeredFields'),
    getFormsData
);

export const getRegisteredField = (deepPath: string) => (state: Pick<RootState, 'formsData'>) =>
    o<Pick<RootState, 'formsData'>, RegisteredFields, FieldState>(getInPath(deepPath), getRegisteredFields)(state);

export const getPristine = (deepPath: string) => (state: Pick<RootState, 'formsData'>) =>
    prop('pristine')(getRegisteredField(deepPath)(state));

export const getFormData = (formName: string) => o(prop(formName), getFormsData);

export const getFormDescriptors = curry((formName: string, state: Pick<RootState, 'fieldDescriptors'>) =>
    o(prop(formName), getFieldDescriptors)(state)
);

export const getFieldVal = (deepPath: string) => (state: Pick<RootState, 'formsData'>) => {
    const formsData = getFormsData(state);
    return getInPath(deepPath, formsData);
};
