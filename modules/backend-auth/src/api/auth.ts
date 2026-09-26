import { DeviceModel } from 'common/models/deviceModel';
import { AuthType } from 'common/constants';
import { UserModel } from 'common/models/userModel';
import { logger } from 'common/logger';
import { Context, KoaContext } from '../types/index.js';
import Router from "@koa/router"
import type Koa from "koa"

function sendDeny(ctx: KoaContext<any, string>, reason: string) {
    logger.debug(`${ctx.URL.pathname} DENY, reason: ${reason}`);
    ctx.body = "deny";
}

function isGuest(userName: string) {
    return userName.startsWith('guest=');
}

function isUser(userName: string) {
    return !isGuest(userName) && !isDevice(userName);
}
function isDevice(userName: string) {
    return userName.startsWith('device=');
}

function splitUserName(userName: string) {
    return removeUserNamePrefix(userName).split('/');
}

function removeUserNamePrefix(userName: string) {
    return userName.replace(/^[^=]+=/, '');
}

/**
 * URL prefix /auth
 * specification https://github.com/rabbitmq/rabbitmq-auth-backend-http
 */
export default () => {
    const router = new Router<Koa.DefaultState, Context>();

    /**
     * Determines whether provided user can log into MQTT broker
     * userName can have following prefixes:
     *  - "guest=" followed by deviceID - for device access to /prefix, password must be targeting realm
     *  - "device=" followed by deviceId - for logging devices with apiKey as password
     *  - without prefix -> user is logging using his userName and password
     * @body { username, password }
     */
    router.post('/user', async function (ctx: KoaContext<{ username: string, password: string }, string>) {
        const { username, password } = ctx.request.body as { username: string, password: string };

        logger.debug('username=' + username, 'password=' + password?.replace(/./g, "*"));

        if (isDevice(username)) {
            const [topicPrefix, deviceId] = splitUserName(username);
            const success = await DeviceModel.login(topicPrefix, deviceId, password);
            if (!success) return sendDeny(ctx, "device provided invalid credentials");

            ctx.body = "allow"
        } else if (isUser(username)) {
            if (!password) return sendDeny(ctx, "user did not provide password")
            if (ctx.temporaryPassService.validatePass({ userName: username, password })) {
                ctx.body = "allow administrator"
                return;
            }

            const result = await ctx.userService.checkCreditals({
                userName: username,
                password,
                authType: AuthType.passwd,
            }, "MQTT client/3");

            result
                .ifRight(
                    (doc) => {
                        if (doc.groups.some((group) => group === 'root' || group === 'admin')) {
                            ctx.body = "allow administrator"
                        } else {
                            sendDeny(ctx, "user is not admin or root")
                        }
                    }
                )
                .ifLeft(() => sendDeny(ctx, "user provided invalid credentials"));
        } else if (isGuest(username)) {
            // in password is Realm
            const doc = await UserModel.findByUserName(password);
            // "guest" for backward compatibility
            if (doc || password === 'guest') {
                ctx.body = "allow"
            }
            else sendDeny(ctx, "guest provided invalid realm");
        } else sendDeny(ctx, "unexpected username schema");
    });

    /** Determines whether client can access targeted vhost
     * @body { username, vhost, ip }
     */
    router.post('/vhost', function (ctx: KoaContext<{ username: string, vhost: string, ip: string }, string>) {
        if (ctx.request.body.vhost === '/')
            ctx.body = "allow"
        else sendDeny(ctx, "unsupported vhost");
    });

    /** Determines whether client can access targeted resource
     * @body { username, vhost, resource, name, permission }
     */
    router.post('/resource', function (ctx: KoaContext<{ username: string, vhost: string, resource: string }, string>) {
        const { resource, username } = ctx.request.body;
        // console.log("/resource", req.body, resource === 'queue' || resource === 'exchange' || /^user=.+/.test(username))
        if (resource === 'queue' || resource === 'exchange' || isUser(username))
            ctx.body = "allow"
        else sendDeny(ctx, "unsupported resource access");
    });

    /** Determines whether client can access targeted topic
     * @body { username, vhost, resource, name. permission, routing_key }
     */
    router.post('/topic', async function (ctx: KoaContext<{ username: string, vhost: string, resource: string, name: string, routing_key: string }, string>) {
        // console.log("/topic", req.body)
        const { vhost, username, name, routing_key } = ctx.request.body;
        const [realm, deviceId] = splitUserName(username);

        // check if user has access
        if (isUser(username)) {
            if (routing_key.startsWith("prefix.")) {
                ctx.body = "allow"
                return
            }
            if (routing_key.startsWith(`v2.${realm}.`)) {
                ctx.body = "allow"
                return
            }

            const user = await UserModel.findByUserName(realm);
            if (user?.groups.includes("admin")) {
                ctx.body = "allow"
                return
            }

            sendDeny(ctx, `${routing_key}, user=${username}`)
        } else if (isDevice(username) && name === 'amq.topic' && vhost === '/') {
            const [realm, deviceId] = splitUserName(username);
            if (routing_key.startsWith(`v2.${realm}.`)) {
                ctx.body = "allow"
                return
            }

            sendDeny(ctx, `${routing_key}, user=${username}`)
        } else {
            const matchedConf = routing_key.match(/^prefix\.([^\.]+)\.([^\.]+)(.*)/);
            //console.log("matched", matchedConf);

            /* Allow only write */
            //console.log("cmp", matchedConf[2], username.replace("guest=", ""));
            if (matchedConf && matchedConf[1] === username.replace(/^guest=/, '')) {
                ctx.body = "allow"
                return
            }

            sendDeny(ctx, `${routing_key}, user=${username}`)
        }
    });

    return router;
}