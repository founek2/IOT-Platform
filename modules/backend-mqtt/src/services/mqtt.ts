import * as mqtt from 'mqtt';
import { Server as serverIO } from 'socket.io';
import handlePrefix from './mqtt/prefix.js';
import handleV2 from './mqtt/v2.js';
import { Maybe } from 'purify-ts/Maybe';
import type { IClientPublishOptions, MqttClient, IClientOptions } from 'mqtt';
import { NotificationService } from './NotificationService.js';
import { InfluxService, logger } from 'common';


export type cbFn = (topic: string, message: any, groups: string[]) => void;
function topicParser(topic: string, message: any) {
    return (stringTemplate: string, fn: cbFn) => {
        const regex = new RegExp('^' + stringTemplate.replace('$', '\\$').replace(/\+/g, '([^/\\$]+)') + '$');
        const match = topic.match(regex) as any;
        if (!match) return;

        const [wholeMatch, ...groups] = match;
        fn(topic, message, groups || []);
    };
}

const SECONDS_20 = 20 * 1000;

interface MqttConf {
    url: string;
    port: number;
}
type GetUser = () => Promise<Maybe<{ userName: string; password: string }>>;
type ClientCb = (client: MqttClient) => void;

// async function connect(config: MqttConf, getUser: GetUser, cb: ClientCb): Promise<MqttClient> {

// }

function applyListeners(io: serverIO, cl: MqttClient, notificationService: NotificationService, influxService: InfluxService) {
    cl.on('connect', function () {
        logger.info('mqtt connected');

        // subscriber to all messages
        cl.subscribe('#', async function (err, granted) {
            if (err) logger.error('problem:', err);
            else logger.info('mqtt subscribed');
        });
    });

    cl.on('message', async function (topic, message) {
        const handle = topicParser(topic, message);
        logger.debug(topic);

        // handle all messages in unauthenticated world
        if (topic.startsWith('prefix/')) handlePrefix(handle, io);
        // handle all message in authenticated prefix
        else if (topic.startsWith('v2/')) handleV2(handle, io, notificationService, influxService);
    });

    cl.on('error', async function (err) {
        logger.error('mqtt connection error', err);
    });
    cl.on('disconnect', async function (err) {
        logger.error('mqtt connection disconnect', err);
    });
}

export class MqttService {
    config: MqttConf;
    notificationService: NotificationService
    influxService: InfluxService
    client: mqtt.MqttClient | undefined

    constructor(config: MqttConf, notificationService: NotificationService, influxService: InfluxService) {
        this.config = config
        this.notificationService = notificationService
        this.influxService = influxService
    }

    connect = async (io: serverIO, getUser: GetUser) => {
        let user = (await getUser()).extractNullable()

        // Refresh every 10 mins
        setInterval(async () => {
            user = (await getUser()).extractNullable()
        }, 10 * 60 * 1000)

        const transformWsUrl: IClientOptions["transformWsUrl"] = (url, options, client) => {
            client.options.username = user?.userName;
            client.options.password = user?.password;

            return url;
        }

        logger.info("Connecting to mqtt", this.config.url)
        this.client = mqtt.connect(this.config.url, {
            username: user?.userName,
            password: user?.password,
            port: this.config.port,
            rejectUnauthorized: false,
            keepalive: 30,
            transformWsUrl
        });

        applyListeners(io, this.client, this.notificationService, this.influxService);
        return this.client;
    }

    publishStr(topic: string, message: string, opt: IClientPublishOptions = {}): boolean {
        if (!this.client) return false;

        this.client.publish(topic, message, opt);
        return true;
    }
}

// /* Initialize MQTT client connection */
// export default async (io: serverIO, config: MqttConf, getUser: GetUser, notificationService: NotificationService) => {
//     client = await connect(config, getUser, (cl) => applyListeners(io, cl, notificationService));
// };
