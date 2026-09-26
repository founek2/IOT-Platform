import auth from './auth.js';
import signIn from './signIn.js';
import signOut from './signOut.js';
import activeSignIn from './activeSignIn.js';
import refresh from './refreshToken.js';
import { Context } from '../types/index.js';
import Router from "@koa/router"
import type Koa from "koa";
import { applyRouter } from "common/utils/applyRouter"

export default (): Router<Koa.DefaultState, Context> => {
    let api = new Router<Koa.DefaultState, Context>();

    applyRouter(api, '/rabbitmq', auth())
    applyRouter(api, '/user/signIn/refresh', refresh())
    applyRouter(api, '/user/signIn/active', activeSignIn())
    applyRouter(api, '/user/signIn', signIn())
    applyRouter(api, '/user/signOut', signOut())

    // expose some API metadata at the root
    api.get('/', (ctx) => {
        ctx.body = { version: '2.0.0' };
    });

    return api;
};
