export enum ActionTypes {
    REGISTER_FIELD = 'REGISTER_FIELD',
    UNREGISTER_FIELD = 'UNREGISTER_FIELD',
    UPDATE_REGISTERED_FIELD = 'UPDATE_REGISTERED_FIELD',
    UPDATE_FORM_STATE = 'UPDATE_FORM_STATE',
    SET_FIELD_DESCRIPTORS = 'SET_FIELD_DESCRIPTORS',
    SET_FORMS_DATA = 'SET_FORMS_DATA',
    UPDATE_FORM = 'UPDATE_FORM',
    UPDATE_FORM_FIELD = 'UPDATE_FORM_FIELD',
    UPDATE_REGISTERED_FIELDS = 'UPDATE_REGISTERED_FIELDS',
    ADD_NOTIFICATION = 'ADD_NOTIFICATION',
    REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION',
    SET_USER = 'SET_USER',
    UPDATE_USER = 'UPDATE_USER',
    ADD_USER = 'ADD_USER',
    REMOVE_USER = 'REMOVE_USER',
    SET_USERS = 'SET_USERS',
    REMOVE_USERS = 'REMOVE_USERS',
    SET_FORM_DATA = 'SET_FORM_DATA',
    UPDATE_USERS = 'UPDATE_USERS',
    RESET_TO_DEFAULT = 'RESET_TO_DEFAULT',
    DEHYDRATE_STATE = 'DEHYDRATE_STATE',
    HYDRATE_STATE = 'HYDRATE_STATE',
    UPDATE_HISTORY = 'UPDATE_HISTORY',
    SET_HISTORY = 'SET_HISTORY',
    UPDATE_TMP_DATA = 'UPDATE_TMP_DATA',
    SET_TMP_DATA = 'SET_TMP_DATA',
    REMOVE_FORM = 'REMOVE_FORM',
}

export const STATE_DEHYDRATED = 'STATE_DEHYDRATED';

export const POSITION_UPDATE_INTERVAL = 1000 * 60 * 5; // 5min