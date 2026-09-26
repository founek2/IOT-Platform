
import { checkValid, types, validateForm } from '../validations/index.js';

export const checkValidFormData = (
    formData: { [formName: string]: any },
    fieldDescriptors: any,
    ingoreRequired?: boolean
) => {
    const state: types["State"] = {
        formsData: {
            registeredFields: {},
            ...formData,
        },
        fieldDescriptors,
    };
    const result = validateForm(Object.keys(formData)[0], state, ingoreRequired);
    return checkValid(result);
};
