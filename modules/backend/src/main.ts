import { JwtService, UserService } from 'common';
import loadersInit from './loaders/index.js';
import { MailerService } from './services/mailerService.js';
import { Config } from './config.js';
import { Actions } from './services/actionsService.js';
import { BrokerService } from './services/brokerService.js';
import { BusEmitterType } from "common/interfaces/asyncEmitter"
import { PassKeeper } from "common/services/passKeeperService";
import Router from '@koa/router';
import Koa from "koa"
import { Context } from './types/index.js';
import api from './api/index.js';
import api2 from './api/v2/index.js';
import { applyRouter } from 'common/utils/applyRouter';

export * from "./config.js"
export async function bindServer(router: Router<Koa.DefaultState, Context>, config: Config, bus: BusEmitterType) {
    /* INITIALIZE */
    const jwtService = new JwtService(config.jwt); // used in WebSocket middleware
    const mailerService = new MailerService(config);
    const userService = new UserService(jwtService)
    const actionsService = new Actions(bus)
    const passKeper = new PassKeeper(bus);
    const brokerService = new BrokerService(actionsService, config.mqtt, passKeper)
    const context = {
        jwtService,
        mailerService,
        userService,
        actionsService,
        brokerService,
    };

    router.use("/api/main", (ctx, next) => {
        ctx.mailerService = mailerService;
        ctx.userService = userService;
        ctx.actionsService = actionsService;
        ctx.brokerService = brokerService;
        ctx.jwtService = jwtService;
        return next()
    })
    router.use("/api/v2", (ctx, next) => {
        ctx.mailerService = mailerService;
        ctx.userService = userService;
        ctx.actionsService = actionsService;
        ctx.brokerService = brokerService;
        ctx.jwtService = jwtService;
        return next()
    })

    applyRouter(router, '/api/v2', api2());
    applyRouter(router, '/api/main', api({ config }));

    await loadersInit({ config, context });

    return { router, context }
}