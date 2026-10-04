import React from 'react';
import { VirtualDevice } from '../components/VirtualDevice.js';
import { useWebMqttUrlQuery } from '../endpoints/config.js';
import { useAppSelector } from '../hooks/index.js';
import { getCurrentUser, getVirtualDevice } from '../selectors/getters.js';

export function VirtualDeviceConnect() {
    const { enabled, name } = useAppSelector(getVirtualDevice);
    const realm = useAppSelector(getCurrentUser)?.realm;
    const active = enabled && Boolean(realm);
    const { data: mqttUrl } = useWebMqttUrlQuery(undefined, { skip: !active });

    if (!active || !realm || !mqttUrl) return null;

    return <VirtualDevice realm={realm} name={name} mqttUrl={mqttUrl} />;
}
