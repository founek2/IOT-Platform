import { validationMessageKey } from '../localization/validationMessages.js';

export type ValidationFn = (value: any, options?: any) => true | validationMessageKey;

export type FieldDescriptor = {
    deepPath: string;
    required?: boolean;
    when?: ((formData: any, options: { deepPath: string; i?: number }) => boolean) | null;
    getLength?: ((formData: any) => number | undefined) | null | undefined; // just when deepPath ends with [] -> will be array of fields
    label?: string | null | undefined;
    name?: string | null | undefined;
    validations?: Array<(value: any) => string | true>;
};

export type FieldState = {
    pristine: boolean;
    valid: boolean;
    errorMessages?: Array<string>;
};

export type FormRegisteredFields = { [key: string]: FieldState | FormRegisteredFields };
export type RegisteredFields = { [formName: string]: FormRegisteredFields };

export type FormFieldDescriptors = { [fieldPath: string]: FormFieldDescriptors | FieldDescriptor };
export type FieldDescriptors = { [formName: string]: { [name: string]: FormFieldDescriptors | FieldDescriptor } };

export type FormData = { [fieldName: string]: any };
export type FormsData = {
    registeredFields: RegisteredFields;
    [formName: string]: FormData;
};
