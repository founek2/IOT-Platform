import Router from '@koa/router';
import { readDevicePermissionMiddleware } from 'common/middlewares/device/readDevicePermissionMiddleware';
import { tokenAuthMiddleware } from 'common/middlewares/tokenAuthMiddleware';
import type Koa from "koa";
import { Context } from '../types/index.js';

/**
 * URL prefix /device/:deviceId/thing/:thingId/history
 */
export default () => {
    let api = new Router<Koa.DefaultState, Context>();

    api.get("/",
        tokenAuthMiddleware(),
        readDevicePermissionMiddleware({ paramKey: 'deviceId' }),
        async (ctx) => {
            const { deviceId, thingId } = ctx.params;
            const { from, to } = ctx.query;

            const rows = await ctx.influxService.getMeasurements(
                deviceId,
                thingId,
                new Date(Number(from)),
                new Date(to ? Number(to) : new Date())
            );

            ctx.body = { docs: rows };
        })

    return api;
}