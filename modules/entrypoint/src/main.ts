import * as backendModule from 'backend'
import * as authModule from 'backend-auth'
import * as mqttModule from 'backend-mqtt'
import Koa, { DefaultState } from "koa"
import { logger } from "common"
import http from 'node:http';
import { AddressInfo } from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import morgan from './morgan.js';
import mongoSanitize from 'koa-mongo-sanitize';
import bodyParser from 'koa-bodyparser';
import { BusEmitter } from "common/interfaces/asyncEmitter"
import koaStatic from "koa-static";
import Router from "@koa/router"
import send from 'koa-send'

interface Module<T> {
    bindServer: (app: Koa<Koa.DefaultState, Koa.DefaultContext>, config: T, server: http.Server) => Promise<Koa>,
    loadConfig: () => T
}


export async function createServer() {
    const app = new Koa();
    const server = http.createServer(app.callback());

    // Logger
    const reqLogger = morgan('dev');
    app.use(async (ctx, next) => {
        if (process.env.DEBUG_RABBITMQ) {
            return reqLogger(ctx, next)
        } else {
            // Ignore rabbitmq auth endpoints
            if (/^(?!\/api\/auth\/rabbitmq\/).+/.test(ctx.URL.pathname))
                return reqLogger(ctx, next)
            else
                return next()
        }
    });

    app.use(bodyParser());

    // mongo sanitizer (removes $ from keys)
    app.use(mongoSanitize());

    // server static frontend files
    const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
    const frontend_path = path.join(moduleDirectory, '../../frontend/build');
    app.use(koaStatic(frontend_path));

    // const modules: Module<any>[] = [backendModule, authModule, mqttModule];
    // Promise.all(modules.map((mod) => mod.bindServer(app, mod.loadConfig(), server)))
    const bus = new BusEmitter();

    // intercept all events
    const old_emit = bus.emit;
    bus.emit = function () {
        logger.debug("Event", arguments[0]);
        old_emit.apply(bus, arguments as any);
    }

    const router = new Router() as Router<DefaultState, any>;
    await authModule.bindServer(router, authModule.loadConfig(), bus)
    await mqttModule.bindServer(router, mqttModule.loadConfig(), bus, server)
    await backendModule.bindServer(router, backendModule.loadConfig(), bus)

    // Print all registered routes
    // console.log(router.stack.map(i => i.path));

    // router.use('/api/(.*)', (ctx) => {
    //     console.log("status 404")
    //     ctx.status = 404
    // })

    // fallback for paths without "api" prefix and file extension
    router.get(/^\/(?!api\/)[^.]+$/, async (ctx) => {
        ctx.status = 200
        await send(ctx, 'index.html', { root: frontend_path })
    });

    app
        .use(router.routes())
        .use(router.allowedMethods());

    // app.use("*", (req, res) => {
    //     res.sendStatus(404)
    // })

    // const jsonErrorHandler = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    //     logger.error(err)
    //     res.status(500).send({ error: err });
    // }
    // app.use(jsonErrorHandler)

    const port = parseInt(String(process.env.PORT)) || 8085
    server.listen(port, () => {
        const addr = server.address() as AddressInfo;
        logger.info(`Started on port http://${addr.address}:${addr.port}`);
    })
}