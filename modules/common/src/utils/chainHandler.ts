import { __, apply, compose, filter, forEach } from 'ramda';
import isNotNil from './isNotNil.js';

type handlers = Array<undefined | null | ((arg: any) => void)>

/**
 * Chain multiple handlers and invoke each other with same params. Also filter nil handlers.
 *
 * @documented
 * @category Function
 * @param {Functions} handlers array of handlers
 * @param {*} args
 *
 */
const chainHandlers = (handlers: handlers) => (...args: any[]) => compose<handlers, void>(
    // @ts-expect-error
    forEach(apply(__, args)), filter(isNotNil))(handlers);

export default chainHandlers;