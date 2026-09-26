import { combineReducers } from '@reduxjs/toolkit';
import devices from './deviceSlice.js';
import things from './thingSlice.js';
import setting from './setting.js';
import locations from './locationSlice.js';
import dashboard from './dashboardSlice.js';

export default combineReducers({
    devices,
    things,
    setting,
    locations,
    dashboard
});
