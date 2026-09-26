import { EventEmitter } from 'events';
import { generateDeviceId } from '../utils/generateDeviceId.js';

type EventMap = Record<string, any>;

type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

export interface Emitter<T extends EventMap> {
    on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
    off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
    emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
}

class MyEmitter<T extends EventMap> implements Emitter<T> {
    private emitter = new EventEmitter();
    on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>) {
        this.emitter.on(eventName, fn);
    }

    off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>) {
        this.emitter.off(eventName, fn);
    }

    emit<K extends EventKey<T>>(eventName: K, params: T[K]) {
        this.emitter.emit(eventName, params);
    }
}

export type AccessTokenData = {
    token: string
    expiresAt: number
};
export interface EmitterEvents {
    new_access_token: AccessTokenData;
    invalid_token: void;
}

const ID_KEY = 'deviceId';
const STORAGE_KEY = "accessToken"
class InternalStorage extends MyEmitter<EmitterEvents> {
    constructor() {
        super()

        this.on("new_access_token", (data) => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        })
    }

    getAccessToken(): AccessTokenData | undefined {
        const data = localStorage.getItem(STORAGE_KEY)
        return data ? JSON.parse(data) : undefined
    }

    deleteAccessToken() {
        localStorage.removeItem(STORAGE_KEY)
    }

    getDeviceId(): String {
        const id = localStorage.getItem(ID_KEY);
        if (id) return id;

        const newId = generateDeviceId();
        localStorage.setItem(ID_KEY, newId);
        return newId;
    }
}

const internalStorage = new InternalStorage();
export default internalStorage;