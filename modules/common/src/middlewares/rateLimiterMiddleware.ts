import { RateLimiterMemory } from 'rate-limiter-flexible';
import { KoaContext } from '../types/index.js';
import { Next } from 'koa';
import { sendError } from '../utils/sendError.js';

const opts = {
    points: 10, // 10 points
    duration: 60, // Per minute
};

const rateLimiter = new RateLimiterMemory(opts);

/**
 * Middleware limits requrest rate
 */
export const rateLimiterMiddleware = async (ctx: KoaContext, next: Next) => {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') return next();

    try {
        await rateLimiter
            .consume(ctx.request.ip)
        return next();
    } catch (err) {
        sendError(429, "Too Many Requests", ctx)
    }
};
