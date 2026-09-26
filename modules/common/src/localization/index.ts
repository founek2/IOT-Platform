import { logger } from '../logger/index.js';

export type Message = ((options?: any) => string) | string;
export type Messages = { [messageKey: string]: Message };

export function messageFactory<T extends Messages, K extends keyof T>(messages: T) {
    return {
        getMessage: (messageKey: K, fieldValue: any = '', arg?: any): string => {
            const message = messages[messageKey];
            if (message) {
                if (typeof message === 'function') {
                    return message({ ...arg, fieldValue });
                } else {
                    return message;
                }
            } else {
                logger.error('missing Message: ' + String(messageKey));
                return '$' + String(messageKey);
            }
        },
    };
}
