import type Router from "@koa/router";
import { JwtService, UserService } from 'common';
import { BusEmitterType } from 'common/interfaces/asyncEmitter';
import { connectMongoose } from 'common/utils/connectMongoose';
import { applyRouter } from 'common/utils/applyRouter';
import type Koa from "koa";
import api from './api/index.js';
import { Config } from './config.js';
import eventEmitter from './services/eventEmitter.js';
import { OAuthService } from './services/oauthService.js';
import { TemporaryPass } from './services/TemporaryPass.js';
import initSubscribers from './subscribers/index.js';
import { Context } from './types/index.js';

export * from "./config.js";
export async function bindServer(router: Router<Koa.DefaultState, Context>, config: Config, bus: BusEmitterType) {
    /* INITIALIZE */
    const jwtService = new JwtService(config.jwt); // used in WebSocket middleware
    const userService = new UserService(jwtService)
    const oauthService = new OAuthService(config.oauth); // used in WebSocket middleware
    const temporaryPassService = new TemporaryPass(bus, config.mqtt);

    initSubscribers(eventEmitter);

    await connectMongoose(config.dbUri);

    router.use("/api/auth", (ctx, next) => {
        ctx.oauthService = oauthService;
        ctx.userService = userService;
        ctx.jwtService = jwtService;
        ctx.temporaryPassService = temporaryPassService;
        return next()
    })

    applyRouter(router, '/api/auth', api())

    return { router }
}