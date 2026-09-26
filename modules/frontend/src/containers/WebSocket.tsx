import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/index.js';
import { PropertyState, Thing, thingsReducerActions } from '../store/slices/application/thingsSlice.js';
import { useLazyDevicesQuery } from '../endpoints/devices.js';
import { Device, devicesReducerActions } from '../store/slices/application/devicesSlice.js';
import { io, Socket } from 'socket.io-client';
import { discoveryReducerActions } from '../store/slices/application/discoverySlice.js';
import { Discovery } from '../endpoints/discovery.js';
import internalStorage from '../services/internalStorage.js';
import { isLoggedIn } from "../selectors/getters.js"
import NetworkStatus from './NetworkStatus.js';

export type SocketUpdateThingState = {
    _id: Device['_id'];
    thing: {
        _id: Thing['_id'];
        nodeId: Thing['config']['nodeId'];
        state: Record<string, PropertyState>;
    };
};

function WebSocket() {
    const loggedIn = useAppSelector(isLoggedIn)
    const [fetchDevices, { fulfilledTimeStamp }] = useLazyDevicesQuery();
    const dispatch = useAppDispatch();
    const [socket, setSocket] = useState<Socket>();

    useEffect(() => {
        if (!loggedIn) return;

        function refreshConnection(accessToken: { token: string }) {
            if (socket) socket.close();

            const newCon = io({
                path: '/socket.io',
                query: {
                    token: accessToken.token,
                },
            });
            newCon.open();
            setSocket(newCon);
        }
        const accessToken = internalStorage.getAccessToken()
        if (accessToken) refreshConnection(accessToken)

        internalStorage.on("new_access_token", refreshConnection)
        return () => internalStorage.off("new_access_token", refreshConnection)
    }, [loggedIn]);

    useEffect(() => {
        if (!socket) return;

        function updateDevice(payload: Device) {
            console.log('web socket GOT device', payload);
            dispatch(devicesReducerActions.updateOne({ id: payload._id, changes: payload }));
        }

        function updateControl({ _id, thing }: SocketUpdateThingState) {
            console.log('web socket GOT thing', _id, thing);
            dispatch(
                thingsReducerActions.updateOneState({
                    id: thing._id,
                    changes: thing.state,
                })
            );
        }

        function addDiscoveredDevice(device: Discovery) {
            dispatch(discoveryReducerActions.upsertOne(device));
        }

        socket.on('device', updateDevice);
        socket.on('control', updateControl);
        socket.on('deviceDiscovered', addDiscoveredDevice);

        return () => {
            socket.off('device', updateDevice);
            socket.off('control', updateControl);
            socket.off('deviceDiscovered', addDiscoveredDevice);
        };
    }, [dispatch, socket]);

    useEffect(() => {
        let mounted = true;
        async function handler() {
            if (document.visibilityState === "hidden") return;

            const isOld = !fulfilledTimeStamp || Date.now() - new Date(fulfilledTimeStamp).getTime() > 5 * 60 * 1000;
            if (loggedIn && (isOld || socket?.disconnected)) {
                console.log('refreshing on focus', isOld, socket?.disconnected);
                // Add little bit of timeout to give device time to setup network after waking from sleep
                setTimeout(async () => {
                    if (mounted) await fetchDevices(undefined)
                }, window.navigator.onLine ? 0 : 500);
            }
        }

        window.addEventListener('focus', handler);
        document.addEventListener('visibilitychange', handler);

        return () => {
            mounted = false;
            window.removeEventListener('focus', handler);
            document.removeEventListener('visibilitychange', handler);
        };
    }, [fulfilledTimeStamp, fetchDevices, socket, loggedIn]);

    return <NetworkStatus socket={socket} />;
}

export default WebSocket;
