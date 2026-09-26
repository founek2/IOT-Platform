import { loggerFn } from './fn.js';

// @ts-ignore
const isNode = typeof window === 'undefined';

const loggerCSS = loggerFn(!isNode);

const consoleLog = loggerCSS(console);

export enum LogLevel {
    ERROR,
    WARNING,
    INFO,
    DEV,
    DEBUG,
    SILLY,
}

export const logger = {
    info: consoleLog('green', 'INFO   ', LogLevel.INFO),
    warning: consoleLog('orange', 'WARNING', LogLevel.WARNING),
    error: consoleLog('red', 'ERROR  ', LogLevel.ERROR),
    debug: consoleLog('blue', 'DEBUG  ', LogLevel.DEBUG),
    silly: consoleLog('yellow', 'SILLY  ', LogLevel.SILLY),
};
