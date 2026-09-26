import { and, equals, has, is, isNil, or } from 'ramda';
import { validationMessageKey } from '../localization/validationMessages.js';
import isNotEmpty from '../utils/isNotEmpty.js';
import { transformToForm } from './transformToForm.js';
import { validateFormBE } from './index.js';

type ValidationResult = true | validationMessageKey;

const maxLength = (value: Array<any> | string, max: number) => value && value.length <= max;

const minLength = (value: Array<any> | string, min: number) => value && min <= value.length;

export const isBool = (value: any): ValidationResult =>
    is(Boolean, value) || value === 'true' || value === 'false' ? true : 'notBool';

type isStringOptions = { min?: number; max?: number; startsWith?: string; notEqual?: string; pattern?: RegExp };
export const isString = (
    value: any,
    { min, max, startsWith, notEqual, pattern }: isStringOptions = {}
): ValidationResult => {
    if (!is(String, value)) return `notString`;

    if (startsWith && !new RegExp(`^${startsWith}`).test(value)) return 'notStartsWith';
    if (min && !minLength(value, min)) return 'lowerLength';
    if (max && !maxLength(value, max)) return 'higherLength';
    if (pattern && !pattern.test(value)) return 'notMatchPattern';
    if (notEqual && equals(value, notEqual)) return 'stringCannotEqualTo';
    return true;
};

export const noNumbers = (value: any): ValidationResult => {
    return !/[0-9]/.test(value) || 'cannotContainNumbers';
};
const minValue = (value: number, min: number) => min <= value;

const maxValue = (value: number, max: number) => value <= max;

export const isNumber = (value: any, { max, min }: { max?: number; min?: number } = {}): ValidationResult => {
    if (typeof value != 'number') return `notNumber`; // because input can save it as text
    if (min && !minValue(value, min)) return 'lowerValue';
    if (max && !maxValue(value, max)) return 'higherValue';
    return true;
};

export const isRequired = (value: any) => {
    return (!isNil(value) && isNotEmpty(value)) || 'isRequired';
};

export const isArray = (value: any, { descriptor, min, max }: any = {}) => {
    if (!is(Array, value)) return 'isRequired';
    if (min && !minLength(value, min)) return 'lowerLength';
    if (max && !maxLength(value, max)) return 'higherLength';
    if (!descriptor) return true;

    return (value as Array<any>).map((obj) => isObject(obj, { descriptor })).find((it) => it !== true) || true;
};

export const isNotEmptyArray = (value: any) => isArray(value, { min: 1 });

export const isPhoneNumber = (value: any) =>
    /^(\+420)? ?[1-9][0-9]{2} ?[0-9]{3} ?[0-9]{3}$/.test(value) || 'isNotPhoneNumber';

export const isEmail = (value: any) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/.test(value) || 'isNotEmail';

export const isFile = (value: any) => and(or(has('data', value), has('url', value)), has('name', value)) || 'isNotFile'; // TODO validate extension

export const isOneOf = (value: any, { values }: { values: Array<any> }) =>
    values.some((val) => value === val) || 'isNotOneOf';

export const isTime = (value: any) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value) || 'isNotTime';

export const isIpAddress = (value: any) =>
    /^((25[0-5]|(2[0-4]|1[0-9]|[1-9]|)[0-9])(\.(?!$)|$)){4}$/.test(value) || 'isNotIpAddress';

export const isObject = (value: any, { descriptor }: any = {}) => {
    if (Object.prototype.toString.call(value) !== '[object Object]') return 'isNotObject';
    if (!descriptor) return true;

    const result = validateFormBE('FORM_NAME', {
        formsData: { FORM_NAME: value, registeredFields: {} },
        fieldDescriptors: { FORM_NAME: transformToForm('FORM_NAME', descriptor) },
    });

    return result.valid || 'isNotValidObject';
};
