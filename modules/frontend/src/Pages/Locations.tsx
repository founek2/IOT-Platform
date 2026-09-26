import React from "react"
import { useDevicesQuery } from '../endpoints/devices.js';
import Locations from './locations/Locations.js';
import { LocationsLoader } from "./Locations.loader";

export interface RoomProps {
    title?: string;
}
export default function LocationsPage({ title }: RoomProps) {
    const { isLoading } = useDevicesQuery(undefined, { pollingInterval: 10 * 60 * 1000 });

    return (
        <>
            {isLoading ? <LocationsLoader /> : <Locations title={title} />}
        </>
    );
}
