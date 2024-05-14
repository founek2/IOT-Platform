import initSubscribers from './subscribers';
import { connectMongoose } from 'common/lib/utils/connectMongoose';
import eventEmitter from './services/eventEmitter';
import { Config } from './config';
import api from './api';
import { Context } from './types';
import { JwtService, InfluxService, UserService } from 'common';
import { Server } from 'http';
import { Server as serverIO } from 'socket.io';
import { MqttService } from './services/mqtt';
import { NotificationService } from './services/NotificationService';
import { Just } from 'purify-ts';
import { BusEmitterType } from 'common/lib/interfaces/asyncEmitter';
import { PassKeeper } from 'common/lib/services/passKeeperService';
import type Router from "@koa/router"
import type Koa from "koa"
import { migrate } from './services/migrations';

export * from "./config"
export async function bindServer(router: Router<Koa.DefaultState, Context>, config: Config, bus: BusEmitterType, server: Server) {
    /* INITIALIZE */
    const jwtService = new JwtService(config.jwt); // used in WebSocket middleware
    const influxService = new InfluxService(config.influxDb)
    const notificationService = new NotificationService({
        publicVapidKey: config.notification.vapidPublicKey,
        privateVapidKey: config.notification.vapidPrivateKey,
        emailVapid: config.notification.vapidEmail,
        homepageUrl: config.homepage
    })
    const mqttService = new MqttService(config.mqtt, notificationService, influxService);
    const passKeper = new PassKeeper(bus);
    const userService = new UserService(jwtService);

    initSubscribers(eventEmitter, mqttService);

    await connectMongoose(config.dbUri);
    await migrate(config);

    const io = new serverIO(server, { path: '/socket.io' });

    router.use("/api/mqtt", (ctx, next) => {
        ctx.jwtService = jwtService
        ctx.influxService = influxService
        ctx.mqttService = mqttService
        ctx.userService = userService
        return next()
    })
    const apiRoutes = api({ io, jwtService, bus });
    router.use('/api/mqtt', apiRoutes.routes(), apiRoutes.allowedMethods());

    const { userName, password } = config.mqtt;
    const getPass = userName && password ? async () => Just({ userName, password }) : () => passKeper.getPass()

    setTimeout(() => {
        mqttService.connect(io, getPass)
    }, 1000)

    return { router, io }
}