import { KoaContext } from '../types/index.js';

type Status = 400 | 401 | 403 | 404 | 409 | 429 | 500
export function sendError(status: Status, error: string, ctx: KoaContext) {
    ctx.status = status
    ctx.body = { error }
}