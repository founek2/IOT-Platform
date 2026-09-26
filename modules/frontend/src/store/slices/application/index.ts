import { combineReducers } from '@reduxjs/toolkit';
import authorization from './authorizationSlice.js';
import devices from './devicesSlice.js';
import things from './thingsSlice.js';
import discovery from './discoverySlice.js';
import users from './usersSlice.js';

export default combineReducers({
    authorization,
    devices,
    discovery,
    things,
    users,
});
