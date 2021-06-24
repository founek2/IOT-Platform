import { prop, o, path, curry } from 'ramda';
import { RootState } from '../store/store';

export const getApplication = (state: RootState) => state.application;

export const getHistory = (state: RootState) => state.history;

export const getDevices = o((app) => app.devices.data, getApplication);

// export const getDevices = o(path(['devices', 'data']), getApplication);

// export const getQueryID = o(path(['query', 'id']), getHistory);
export const getQueryID = o((app) => app.query.id, getHistory);

// export const getQueryField = curry((name, state) => o(path(['query', name]), getHistory)(state));
export const getQueryField = curry((field: string, state: RootState) =>
    o((history) => history.query[field], getHistory)(state)
);

export const getUserNames = o(prop('userNames'), getApplication);

export const getDiscovery = o(prop('discovery'), getApplication);

export const getThingHistory = o(prop('thingHistory'), getApplication);