import thing from './thing';
import propertyState from './propertyState';
import thingState from './thingState';
import Router from '@koa/router';
import Koa from "koa"
import { Context } from '../../types/index';
import { applyRouter } from 'common/lib/utils/applyRouter';

export default () => {
    let api = new Router<Koa.DefaultState, Context>();

    // mount the user resource
    applyRouter(api, '/realm/:realm/device/:deviceId/thing/:nodeId/state', thingState());
    applyRouter(api, '/realm/:realm/device/:deviceId/thing/:nodeId', thing());
    applyRouter(api, '/realm/:realm/device/:deviceId/thing/:nodeId/property/:propertyId/state', propertyState());
    // api.use('/realm/:realm/device/:deviceId/thing/:nodeId/state', thingState());
    // api.use('/realm/:realm/device/:deviceId/thing/:nodeId', thing());
    // api.use('/realm/:realm/device/:deviceId/thing/:nodeId/property/:propertyId/state', propertyState());

    // expose some API metadata at the root
    api.get('/', (ctx) => {
        ctx.body = { version: '2.1.0' };
    });

    return api;
};
