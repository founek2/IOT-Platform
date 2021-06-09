import mqtt, { MqttClient } from 'mqtt';
import { Server as serverIO } from 'socket.io';
import handlePrefix from './mqtt/prefix';
import handleV2 from './mqtt/v2';
import { infoLog, devLog, errorLog } from 'framework-ui/lib/logger';

let client: mqtt.MqttClient | undefined;

type qosType = { qos: 0 | 2 | 1 | undefined };
export function publishStr(topic: string, message: string, opt: qosType = { qos: 2 }): boolean {
    if (!client) return false;

    client.publish(topic, message, { qos: opt.qos });
    return true;
}

export function publish(topic: string, message: string, opt: qosType = { qos: 2 }): boolean {
    if (!client) return false;

    client.publish(topic, message, { qos: opt.qos });
    return true;
}

export type cbFn = (topic: string, message: any, groups: string[]) => void;
function topicParser(topic: string, message: any) {
    return (stringTemplate: string, fn: cbFn) => {
        const regex = new RegExp('^' + stringTemplate.replace('$', '\\$').replace(/\+/g, '([^/\\$]+)') + '$');
        const match = topic.match(regex) as any;
        //console.log("matching topic=" + topic, "by regex=" + regex, "result=" + match);
        if (!match) return;

        const [wholeMatch, ...groups] = match;
        fn(topic, message, groups || []);
    };
}

interface MqttConf {
    url: string;
    port: number;
}
type GetUser = () => Promise<{ userName?: string; password: string }>;

function connect(config: MqttConf, getUser: GetUser) {
    infoLog('Waiting for root account...');
    return reconnect(config, getUser);
}

async function reconnect(config: MqttConf, getUser: GetUser): Promise<MqttClient> {
    const user = await getUser();
    if (!user.userName)
        return new Promise((res) => {
            setTimeout(() => res(reconnect(config, getUser)), 20 * 1000);
        });

    return mqtt.connect(config.url, {
        username: `${user.userName}`,
        password: `${user.password}`,
        reconnectPeriod: 0,
        port: config.port,
        rejectUnauthorized: false,
    });
}

function applyListeners(io: serverIO, client: MqttClient, config: MqttConf, getUser: GetUser) {
    client.on('connect', function () {
        infoLog('mqtt connected');

        // subscriber to all messages
        (client as MqttClient).subscribe('#', async function (err, granted) {
            if (err) devLog('problem:', err);
        });
    });

    client.on('message', async function (topic, message) {
        const handle = topicParser(topic, message);
        devLog(topic);

        // handle all messages in unauthenticated world
        if (topic.startsWith('prefix/')) handlePrefix(handle, io);
        // handle all message in authenticated prefix
        else if (topic.startsWith('v2/')) handleV2(handle, io);
    });

    client.on('error', async function (err) {
        errorLog('mqtt connection error', err);
        client.end();
        client = await connect(config, getUser);
    });
}

/* Initialize MQTT client connection */
export default async (io: serverIO, config: MqttConf, getUser: GetUser) => {
    infoLog('connecting to mqtt');

    client = await connect(config, getUser);

    applyListeners(io, client, config, getUser);
};
