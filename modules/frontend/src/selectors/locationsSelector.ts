import { createSelector } from 'reselect';
import { buildingsCachedSelector } from './devicesSelector.js';

export const locationsSelector = createSelector(buildingsCachedSelector, (buidlings) =>
    buidlings.map((building) => ({
        id: building.id,
        name: building.name,
        rooms: building.rooms.map((room) => ({ name: room.name, _id: room.id })),
    }))
);
