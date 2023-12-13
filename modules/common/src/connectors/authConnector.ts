import { Just, Nothing, Maybe } from 'purify-ts/Maybe';
import fetch from 'node-fetch';

// /api/auth/rabbitmq/pass
export function AuthConnector(endpointUri: string) {
    return {
        getPass: async function (): Promise<Maybe<{ userName: string; password: string; validTo: Date }>> {
            const res = await fetch(`${endpointUri}/api/auth/temporaryPass`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            return res.status === 200 ? Just((await res.json() as any).pass) : Nothing;
        },
    };
}