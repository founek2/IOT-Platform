import { loadConfig } from './config.js';
import { logger } from 'common/logger';
import { bindServer } from './main.js';
import { BusEmitter } from 'common/interfaces/asyncEmitter';
import Koa from "koa"
import http from "http"
import { AddressInfo } from 'net';
import Router from '@koa/router';
import { Context } from './types/index.js';

const config = loadConfig();
const app = new Koa();
const server = http.createServer(app.callback());
const router = new Router<Koa.DefaultState, Context>()

bindServer(router, config, new BusEmitter(), server);
/* Start server */
server.listen(config.portMqtt, () => {
    const addr = server.address() as AddressInfo;
    logger.info(`Started on port http://${addr.address}:${addr.port}`);
})

app.use(router.routes())
app.use(router.allowedMethods())