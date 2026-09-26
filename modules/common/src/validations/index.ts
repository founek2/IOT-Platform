import { forEach, is, clone, forEachObjIndexed, uniq, F, isNil, ifElse, identity, mapObjIndexed } from 'ramda';
import getInPath from '../utils/getInPath.js';
import {
    getFieldDescriptor,
    getFormsData,
    getPristine,
    getFormDescriptors,
    getFormData,
    getRegisteredFields,
} from '../utils/getters.js';
import isNotEmpty from '../utils/isNotEmpty.js';
import setInPath from '../utils/setInPath.js';
import ValiadtionMessages from '../localization/validationMessages.js';
import { ErrorMessageKey } from '../localization/error.js';
import { FieldDescriptor, FieldDescriptors, FieldState, FormsData } from './types.js';
import isObject from '../utils/isObject.js';
export * from "./types.js"

export type types = {
    State: { formsData: FormsData; fieldDescriptors: FieldDescriptors };
    ErrorMessageKey: ErrorMessageKey;
};

const requiredFn = (value: any) => {
    // importing of validationFactory is causing circural dependency
    return (!isNil(value) && isNotEmpty(value)) || ValiadtionMessages.getMessage('isRequired', value);
};
const notEmptyVal = (val: any) => requiredFn(val) === true;

const getWhenOpt = (deepPath: string) => {
    const idx = deepPath.split('.').pop();
    return idx && /[0-9]+/.test(idx) ? { deepPath, i: Number.parseInt(idx) } : { deepPath };
};

export const validateField = (
    deepPath: string,
    state: types['State'],
    ignorePristine = false,
    ignoreRequired = false
): {
    valid: boolean;
    errorMessages: validationResult;
    pristine?: boolean;
} => {
    const pristine = getPristine(deepPath)(state);
    if (!pristine || ignorePristine) {
        const formsData = getFormsData(state);

        const descriptor = getFieldDescriptor(deepPath)(state);

        if (!descriptor || !descriptor.deepPath)
            return {
                valid: false,
                errorMessages: ['missingDescriptor'],
            };
        const { validations } = descriptor;
        const formName = deepPath.split('.')[0];

        const value = getInPath(deepPath, formsData);

        if (isRequired(descriptor, formsData[formName], deepPath) && !ignoreRequired) {
            if (notEmptyVal(value)) {
                const result = createValidationsResult(value, validations);
                return createFieldState(result);
            } else {
                // console.log(deepPath, value, required, notEmptyVal(value))
                const result = createValidationsResult(value, [requiredFn]);
                return createFieldState(result);
            }
        } else {
            if (notEmptyVal(value)) {
                const result = createValidationsResult(value, validations);
                return createFieldState(result);
            } else return createFieldState([]);
        }
    } else return createFieldState([]);
};

function recursive(
    transform: (value: any, pathAccum: string) => void,
    predicate: (val: any, deepPath: string) => boolean,
    arrayPredicate: (value: any, pathAccum: string) => boolean,
    object: object
) {
    const func =
        (accum = '') =>
            (value: any, key: string | number): any => {
                if (arrayPredicate(value, accum + key)) return recArray(value, accum + key + '.'); // pouze pokud existuje descriptor pro array
                if (predicate(value, accum + key)) return recObj(value, accum + key + '.');
                transform(value, accum + key);
            };

    function recObj(obj: object, accum?: string) {
        forEachObjIndexed(func(accum), obj);
    }

    function recArray(obj: Array<any>, accum: string) {
        obj.map(func(accum));
    }
    recObj(object);
}

// TODO use template -> formName is the same as in argument
interface validOutput {
    [key: string]: validOutput | { valid: boolean; errorMessages: Array<types['ErrorMessageKey']> };
}
interface validOutputResult {
    [formName: string]: {
        [key: string]: validOutput | { valid: boolean; errorMessages: Array<types['ErrorMessageKey']> };
    };
}
export function validateForm(formName: string, state: types['State'], ignoreRequiredFields = false): validOutputResult {
    // TODO check why it adds formName itself
    const formDescriptors = getFormDescriptors(formName, state);
    const formData = getFormData(formName)(state);

    const arraOfPaths: Array<string> = [];
    const arrayOfArrayFields: Array<string> = []; // to know when validate array as array and when as array of fields
    let result = {};

    const arrayRegex = /\[\]$/;
    recursive(
        (val, deepPath) => {
            if (arrayRegex.test(deepPath)) {
                const descriptor = getFieldDescriptor(deepPath)(state);
                const len = (descriptor && descriptor.getLength && descriptor.getLength(formData || {})) || 0;
                const base = deepPath.replace(arrayRegex, '');
                for (let i = 0; i < len; ++i) arraOfPaths.push(base + '.' + i);
                arrayOfArrayFields.push(deepPath.replace(arrayRegex, ''));
            } else arraOfPaths.push(deepPath);
        },
        (val) => {
            return isObject(val) && !val.deepPath;
        },
        F,
        { [formName]: formDescriptors }
    );

    // generate deePaths from FormData
    recursive(
        (val, deepPath) => {
            // ignore deepPath, which is only form_name
            if (deepPath.includes('.')) arraOfPaths.push(deepPath);
        },
        (val, deepPath) => {
            return isObject(val) && !/\.[0-9]+$/.test(deepPath); // check if object and validate if deepPath ends with number, then its for array descriptor
        },
        (val) => Array.isArray(val),
        { [formName]: formData }
    );

    const uniqArray = uniq(arraOfPaths);
    // console.log('uniq', uniqArray);
    forEach((deepPath) => {
        const out = validateField(deepPath, state, true, ignoreRequiredFields);
        out.pristine = false;
        result = setInPath(deepPath, out, result);
    }, uniqArray);
    return result;
}

// export const validateFormBE = (formName: string, state: object, ignoreRequiredFields = false) => {
//     // TODO check why it adds formName itself
//     return checkValid(validateForm(formName, state, ignoreRequiredFields))
// };

/**
 * just for FrontEnd validations - validates all registered fields
 * @param formName
 * @param state
 * @param ignoreRequiredFields
 */
export const validateRegisteredFields = (formName: string, state: types['State'], ignoreRequiredFields = false) => {
    const arraOfPaths: Array<string> = [];
    const arrayOfArrayFields: Array<string> = []; // to know when validate array as array and when as array of fields
    let result: { [formName: string]: any } = {};

    // find all deePaths of - fields and array of fields
    // const arrayRegex = /\[\]$/;
    // recursive((val, deepPath) => {
    //     /* Look for array fields */
    //     if (arrayRegex.test(deepPath)) arrayOfArrayFields.push(deepPath.replace(arrayRegex, ""))
    //     // else arraOfPaths.push(deepPath)
    // }, (val) => {
    //     return isObject(val) && !val.deepPath
    // }, F, { [formName]: formDescriptors })

    const regFields = getRegisteredFields(state);
    if (!regFields || !regFields[formName]) return result;

    recursive(
        (val, deepPath) => {
            arraOfPaths.push(deepPath);
        },
        (val) => isObject(val) && val.valid === undefined,
        (val, deepPath) =>
            // Test if array is array of fields or just value
            is(Array, val) && arrayOfArrayFields.some((p) => p === deepPath),

        { [formName]: regFields[formName] }
    );

    const uniqArray = uniq(arraOfPaths);
    forEach((deepPath) => {
        const out = validateField(deepPath, state, true, ignoreRequiredFields);
        out.pristine = false;
        result = setInPath(deepPath, out, result);
    }, uniqArray);
    return result;
};

export const isRequired = (descriptor: FieldDescriptor, formData: { [key: string]: any }, origDeepPath: string) => {
    const { required, when, deepPath } = descriptor;
    if (typeof when === 'function') {
        return when(formData || {}, getWhenOpt(origDeepPath)) && required;
    } else {
        return required;
    }
};

type output = { valid: boolean; errors: Array<{ deepPath: string; errorMessages: Array<types['ErrorMessageKey']> }> };
/**
 * return object {valid: false/true, errors: [{fieldName: ["isRequired"]}]}
 * @param {*} fieldsState
 */
export const checkValid = (fieldsState: validOutput): output => {
    // TODO types
    const output: output = { valid: true, errors: [] };

    const transform = (accum: any) => (value: any, key: any) => {
        if (value.valid === undefined) return transformRec(value, accum + key + '.');
        if (Array.isArray(value)) {
            value.forEach(({ valid, errorMessages }, i) => {
                if (valid === false) {
                    output.valid = false;
                    output.errors.push({ deepPath: `${accum + key}.${i}`, errorMessages });
                }
            });
        } else {
            const { valid, errorMessages } = value;
            if (valid === false) {
                output.valid = false;
                output.errors.push({ deepPath: accum + key, errorMessages });
            }
        }
    };
    function transformRec(fields: any, accum: any) {
        forEachObjIndexed(transform(accum), fields);
    }
    transformRec(fieldsState, '');
    return output;
};

type validationResult = Array<string>;
export function createValidationsResult(
    value: any,
    validations: Array<(fieldValue: any) => true | string> = []
): validationResult {
    const result: validationResult = [];
    validations.forEach((Fn) => {
        const output = Fn(value);
        if (output !== true) {
            result.push(output);
        }
    });
    return result;
}

export function createFieldState(validationResult: validationResult) {
    if (isNotEmpty(validationResult)) {
        return {
            valid: false,
            errorMessages: validationResult,
        };
    } else {
        return {
            valid: true,
            errorMessages: [],
        };
    }
}

export const validateFormBE = (formName: string, state: types['State'], ignoreRequiredFields = false) => {
    return checkValid(validateForm(formName, state, ignoreRequiredFields));
};
