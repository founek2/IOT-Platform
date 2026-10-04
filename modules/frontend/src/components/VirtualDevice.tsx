import { ComponentType, Platform, PropertyDataType } from 'integration';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevicesQuery } from '../endpoints/devices.js';
import { generateDeviceId } from '../utils/generateDeviceId.js';

export const VIRTUAL_DEVICE_NODE_ID = 'dialog';
export const VIRTUAL_DEVICE_PROPERTY_ID = 'thingId';

function getPort(url: string) {
    const { port, protocol } = new URL(url);
    if (port) return Number(port);
    return protocol === 'wss:' ? 443 : 80;
}

interface VirtualDeviceProps {
    realm: string;
    name: string;
    mqttUrl: string;
}

/**
 * Connects this browser to the platform as an IoT device, exposing a property that opens ThingDialog for the given thingId
 */
export function VirtualDevice({ realm, name, mqttUrl }: VirtualDeviceProps) {
    const navigate = useNavigate();
    const navigateRef = useRef(navigate);
    navigateRef.current = navigate;
    // ThingDialog only opens for things already in the store
    useDevicesQuery(undefined, { pollingInterval: 60 * 60 * 1000 });

    useEffect(() => {
        const platform = new Platform(generateDeviceId(), realm, name, mqttUrl, getPort(mqttUrl), window.localStorage);

        const node = platform.addNode(VIRTUAL_DEVICE_NODE_ID, 'Dialog', ComponentType.generic);
        node.addProperty({
            propertyId: VIRTUAL_DEVICE_PROPERTY_ID,
            name: 'Otevřít věc',
            dataType: PropertyDataType.string,
            settable: true,
            callback: (thingId) => {
                navigateRef.current({ search: thingId ? `thingId=${thingId}` : '' }, { replace: true });
                return true;
            },
        });

        platform.init();

        return () => {
            platform.disconnect();
        };
    }, [realm, name, mqttUrl]);

    return null;
}
