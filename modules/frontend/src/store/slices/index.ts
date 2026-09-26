import { ActionFromReducersMapObject, combineReducers, Reducer, StateFromReducersMapObject } from '@reduxjs/toolkit';
import { api } from '../../endpoints/api.js';
import application from './application/index.js';
import formsData from './formDataSlice.js';
import plugins from './pluginsSlice.js';
import notifications from './notificationSlice.js';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/es/storage'; // defaults to localStorage for web
import preferences from './preferences/index.js';

const reducers = {
    [api.reducerPath]: api.reducer,
    application,
    preferences,
    formsData,
    notifications,
    plugins,
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
