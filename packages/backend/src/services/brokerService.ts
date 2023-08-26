import { OverView } from '../types/rabbitmq.js';
import config from 'common/lib/config';
import { Actions } from './actionsService.js';
import { addMinutes, isAfter } from 'date-fns';
import { Maybe, Just, Nothing } from 'purify-ts/Maybe';
import fetch from 'node-fetch';

const CACHE_MINUTES = 3;

type BrokerData = {
    updatedAt: Date;
    overView: OverView;
};

let data: BrokerData;

async function fetchData() {
    if (data?.updatedAt && isAfter(addMinutes(data.updatedAt, CACHE_MINUTES), new Date())) return;

    const url = config.mqtt.url.split('://')[1];
    const auth = await Actions.getBrokerAuth();
    if (!auth) return;

    console.log('Loading overview Broker data');
    const res = await fetch(`http://${url}:${config.mqtt.managementPort}/api/overview`, {
        headers: {
            Authorization: 'Basic ' + auth,
        },
    });
    const body = await res.json() as any;

    data = {
        overView: body,
        updatedAt: new Date(),
    };
}

export const BrokerService = {
    getOverView: async function (): Promise<Maybe<OverView>> {
        try {
            await fetchData();
            return Just(data.overView);
        } catch (err) {
            return Nothing;
        }
    },
};
