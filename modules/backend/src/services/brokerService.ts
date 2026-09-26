import { Connections, OverView } from '../types/rabbitmq.js';
import { Actions } from './actionsService.js';
import { addMinutes, isBefore } from 'date-fns';
import { Maybe, Just, Nothing } from 'purify-ts/Maybe';
import fetch from 'node-fetch';
import { Config } from '../config.js';
import { PassKeeper } from 'common/services/passKeeperService';
import { logger } from 'common';

const CACHE_MINUTES = 3;

type BrokerData = {
    updatedAt: Date;
    overview: OverView;
    connections: Connections,
};

export class BrokerService {
    actionsService: Actions
    url: string
    managementPort: number
    passKeper: PassKeeper
    data: Maybe<BrokerData>;

    constructor(actionsService: Actions, config: Config["mqtt"], passKeper: PassKeeper) {
        this.actionsService = actionsService
        const url = config.url.split('://')[1];
        this.url = url.split("/")[0];
        this.managementPort = config.managementPort
        this.passKeper = passKeper
        this.data = Nothing;

        setInterval(() => {
            // TODO process data and mark disconnected devices as offline
            this.fetchData();
        }, 30 * 60 * 1000);
    }

    getOverView = async (): Promise<Maybe<OverView>> => {
        try {
            await this.fetchData();
            return this.data.map(d => d.overview)
        } catch (err) {
            return Nothing;
        }
    }

    getData = async (): Promise<Maybe<BrokerData>> => {
        try {
            await this.fetchData();
            return this.data
        } catch (err) {
            return Nothing;
        }
    }

    private async getBrokerAuth(): Promise<string | undefined> {
        return (await this.passKeper.getPass()).map((pass) => {
            const auth = Buffer.from(pass.userName + ':' + pass.password, 'utf-8').toString('base64');
            return auth;
        }).extract();
    }

    private fetchData = async () => {
        if (this.data.map(d => isBefore(new Date(), addMinutes(d.updatedAt, CACHE_MINUTES))).orDefault(false)) return;

        const auth = await this.getBrokerAuth();
        if (!auth) return;

        const p1: Promise<OverView> = fetch(`http${this.managementPort === 443 ? "s" : ""}://${this.url}:${this.managementPort}/api/overview`, {
            headers: {
                Authorization: 'Basic ' + auth,
            },
        }).then(res => res.json())

        const p2: Promise<Connections> = fetch(`http${this.managementPort === 443 ? "s" : ""}://${this.url}:${this.managementPort}/api/connections?page=1&page_size=300&name=&use_regex=false`, {
            headers: {
                Authorization: 'Basic ' + auth,
            },
        }).then(res => res.json())

        try {
            const [overview, connections] = await Promise.all([p1, p2])
            logger.silly('Loaded overview Broker data');

            this.data = Just({
                overview,
                connections,
                updatedAt: new Date(),
            })
        } catch (err) {
            logger.error(err)
        }
    }
}



// export const BrokerService = {
//     getOverView: async function (): Promise<Maybe<OverView>> {
//         try {
//             await fetchData();
//             return Just(data.overView);
//         } catch (err) {
//             return Nothing;
//         }
//     },
// };
