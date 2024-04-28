import actions from './actions';
import webSocket from './socket';
import { Server as serverIO } from 'socket.io';
import history from './history';
import { Context } from '../types';
import { BusEmitterType } from 'common/lib/interfaces/asyncEmitter';
import Router from "@koa/router"
import type Koa from "koa";
import { JwtService } from 'common';
import { applyRouter } from "common/lib/utils/applyRouter"

export default ({ io, jwtService, bus }: { io: serverIO, jwtService: JwtService, bus: BusEmitterType }): Router<Koa.DefaultState, Context> => {
    let api = new Router<Koa.DefaultState, Context>();

    applyRouter(api, '/device/:deviceId/thing/:thingId/history', history())

    actions({ bus });

    webSocket(io, jwtService);

    // expose some API metadata at the root
    api.get('/actions', (ctx) => {
        ctx.body = { version: '2.0.0' };
    });

    return api;
};
