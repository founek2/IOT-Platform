import { EntityId } from '@reduxjs/toolkit';
import { logger } from 'common/logger';
import { createSelectorCreator, defaultMemoize } from 'reselect';
import { RootState } from '../store/index.js';
import { Device } from '../store/slices/application/devicesSlice.js';
import { findOrPush } from '../utils/findOrPush.js';

export type Buildings = {
    id: string;
    name: string;
    rooms: { name: string; id: string; deviceIDs: string[]; thingIDs: string[] }[];
}[];

function sameLocations(a: Device, b: Device) {
    return a.info.location.building === b.info.location.building && a.info.location.room === b.info.location.room;
}

const customSelectorCreator = createSelectorCreator(defaultMemoize, (a: Device[], b: Device[]) => {
    if (
        a.length !== b.length ||
        a.some((value, deviceIndex) =>
            // some device not matches ID
            value._id !== b[deviceIndex]._id
            // some device different location
            || !sameLocations(value, b[deviceIndex])
            // different number of things
            || value.things.length !== b[deviceIndex].things.length
            // some device has different things
            || value.things.some((thingId, thingIndex) => thingId !== b[deviceIndex].things[thingIndex]))
    ) {
        logger.debug("Invalidating location cache")
        return false;
    }

    return true;
});

export const buildingsCachedSelector = customSelectorCreator(
    (state: RootState) => state.application.devices.ids.map((id: EntityId) => state.application.devices.entities[id]!),
    (devices) => {
        const buildings: Buildings = [];

        devices.forEach((device) => {
            const { building, room } = device.info.location;
            const buildingObj = findOrPush(
                (buildingObj) => buildingObj.name === building,
                { id: building, name: building, rooms: [] },
                buildings
            );

            const roomObj = findOrPush(
                (roomObj) => roomObj.name === room,
                { id: `${building}/${room}`, name: room, deviceIDs: [], thingIDs: [] },
                buildingObj.rooms
            );

            roomObj.deviceIDs.push(device._id);
            roomObj.thingIDs.push(...device.things);
        });
        logger.debug('Creating list of buildings and rooms...');
        return buildings;
    }
);
