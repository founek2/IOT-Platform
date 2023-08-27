import { ActionFromReducersMapObject, combineReducers, Reducer, StateFromReducersMapObject } from '@reduxjs/toolkit';
import { api } from '../../endpoints/api.js';
import application from './application/index.js';
import formsData from './formDataSlice.js';
import notifications from './notificationSlice.js';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import preferences from './preferences/index.js';

const reducers = {
    [api.reducerPath]: api.reducer,
    application,
    preferences,
    formsData,
    notifications,
};

type ReducersMapObject = typeof reducers;

const rootReducer = combineReducers(reducers);

const persistConfig = {
    key: 'application',
    storage,
    blacklist: [api.reducerPath],
};

export default persistReducer(persistConfig, rootReducer) as unknown as Reducer<
    StateFromReducersMapObject<ReducersMapObject>,
    ActionFromReducersMapObject<ReducersMapObject>
>;
