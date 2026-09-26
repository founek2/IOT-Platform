import ValiadtionMessages from '../localization/validationMessages.js';
import { logger } from '../logger/index.js';
import * as validationFunctions from './validationFn.js';

type functionsType = typeof validationFunctions;

export default function <K extends keyof functionsType>(functionName: K, arg?: Parameters<functionsType[K]>[1]) {
    return function (fieldValue: any) {
        const Fn = validationFunctions[functionName];
        if (Fn) {
            const result = Fn(fieldValue, arg);
            if (result !== true) {
                return ValiadtionMessages.getMessage(result, fieldValue, arg);
            } else {
                return true; // Validation passed
            }
        } else {
            throw new Error('Missing validation Fn named: ' + functionName);
        }
    };
}
