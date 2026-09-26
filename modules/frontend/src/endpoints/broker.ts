import { api } from './api.js';

export type BrokerConnectionItem = {
    name: string //"10.10.5.7:47002 -> 10.10.5.5:15675"
    vhost: string
    user: string
    node: string
};
export type BrokerData<T = BrokerConnectionItem> = {
    overview: any,
    connections: {
        total_count: number
        item_count: number
        items: T[]
    }
    updatedAt: string
}

export enum ConnectionType {
    user, device, guest
}
export type ItemExtended = BrokerConnectionItem & { _id: string, type: ConnectionType, connections: { name: string }[] }

function detectConnectionType(item: BrokerConnectionItem) {
    const user = item.user;
    if (user.startsWith("guest="))
        return ConnectionType.guest;
    if (user.startsWith("device="))
        return ConnectionType.device;

    return ConnectionType.user;
}


export const brokerApi = api.injectEndpoints({
    endpoints: (build) => ({
        broker: build.query<BrokerData<ItemExtended>, void>({
            query: () => `main/broker`,
            providesTags: ['Broker'],
            transformResponse: (body: { data: BrokerData }): BrokerData<ItemExtended> => {
                const items = body.data.connections.items;
                const data: Record<string, ItemExtended> = {};
                items.forEach(item => {
                    if (data[item.user]) {
                        data[item.user].connections.push({ name: item.name })
                    } else {
                        data[item.user] = { ...item, _id: item.user, connections: [{ name: item.name }], type: detectConnectionType(item) }
                    }
                })
                const dataWithId = Object.values(data);

                function sortByName(a: BrokerConnectionItem, b: BrokerConnectionItem,) {
                    return a.user.localeCompare(b.user)
                }
                dataWithId?.sort(sortByName)

                return {
                    overview: body.data.overview,
                    connections: {
                        ...body.data.connections,
                        items: dataWithId
                    },
                    updatedAt: body.data.updatedAt
                };
            }
        }),
    }),
});



export const { useBrokerQuery } = brokerApi;
