import { logger } from '../logger/index.js';
import { checkValidFormData } from '../utils/validation.js';
import { trimData } from '../utils/trimData.js';
import { Next } from 'koa';
import { KoaContext } from '../types/index.js';
import { sendError } from '../utils/sendError.js';

type Options = { ingoreRequired?: boolean; allowedForms?: string[] };
type FormData = { [key: string]: any };

/**
 * Middleware to check if formData in body are valid
 * @param {Options} options - allowedForms restrict forms only to those specified, ingoreRequired can disable checking require for fields
 */
export function formDataMiddleware<C extends KoaContext<{ formData: FormData }>>(fieldDescriptors: any, options: Options = {}) {
    const { ingoreRequired, allowedForms } = options;
    return (ctx: C, next: Next) => {
        logger.debug('Validating formData');
        const formData = ctx.request.body?.formData;

        logger.silly('formData', formData);

        if (!formData)
            return sendError(400, 'missingFormData', ctx);


        if (allowedForms && !Object.keys(formData).every((formName) => allowedForms.includes(formName)))
            return sendError(400, 'notAllowedFormName', ctx);


        if (formData) {
            const trimedData = trimData(formData);
            const { valid, errors } = checkValidFormData(trimedData, fieldDescriptors, ingoreRequired);

            if (valid) {
                return next();
            } else {
                logger.debug('Validation Failed> ' + JSON.stringify(errors));
                return sendError(400, 'validationFailed', ctx);
            }
        }
    };
}
