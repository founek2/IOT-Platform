import { merge, flip, o, toPairs, forEach } from 'ramda';
import { notificationsActions } from '../redux/actions/application/notifications';
import ErrorMessages from '../localization/errorMessages';
import SuccessMessages from '../localization/successMessages';
import { logger } from '../logger';
import { userActions } from '../redux/actions/application/user';
import { dehydrateState } from '../redux/actions/';
import { Dispatch } from '@reduxjs/toolkit';

const addNotification = notificationsActions.add;
const processResponse = (dispatch: Dispatch, successMessage: string) => async (response) => {
    const { status } = response;
    // set new jwt token, when provided from backend

    // const bodyLen = response.headers.get('content-length');
    const contentType = response.headers.get('content-type');
    const isJson = contentType ? ~contentType.indexOf('application/json') : false;

    const jsonBody = isJson ? await response.json() : undefined;
    const errorMessage = jsonBody ? jsonBody.error : undefined;

    const newToken = response.headers.get('authorization-jwt-new');
    if (newToken) {
        logger.info('Setting resigned token');
        dispatch(userActions.update({ token: newToken }));
        // @ts-ignore
        dispatch(dehydrateState());
    }

    if (status === 502 || status === 504) {
        dispatch(
            addNotification({
                message: ErrorMessages.getMessage(errorMessage || 'unavailableBackend'),
                variant: 'error',
                duration: 3000,
            })
        );
        throw new Error('breakChain');
    } else if (status === 500) {
        dispatch(
            addNotification({
                message: ErrorMessages.getMessage(errorMessage || 'unexpectedError'),
                variant: 'error',
                duration: 3000,
            })
        );
        throw new Error('breakChain');
    } else if (status === 501) {
        dispatch(
            addNotification({ message: ErrorMessages.getMessage('notImplemented'), variant: 'error', duration: 3000 })
        );
        throw new Error('breakChain');
    } else if (status === 404) {
        dispatch(
            addNotification({
                message: ErrorMessages.getMessage(errorMessage || 'entityNotFound'),
                variant: 'error',
                duration: 3000,
            })
        );
        throw new Error('breakChain');
    } else if (status === 413) {
        dispatch(
            addNotification({ message: ErrorMessages.getMessage('payloadTooLarge'), variant: 'error', duration: 3000 })
        );
        throw new Error('breakChain');
    } else if (status === 403) {
        dispatch(
            addNotification({
                message: ErrorMessages.getMessage('invalidPermissions'),
                variant: 'error',
                duration: 3000,
            })
        );
        throw new Error('breakChain');
    } else if (status === 400) {
        dispatch(
            addNotification({
                message: ErrorMessages.getMessage(errorMessage || 'InvalidParam'),
                variant: 'error',
                duration: 3000,
            })
        );
        throw new Error('breakChain');
    } else if (status === 204) {
        if (successMessage)
            return dispatch(
                addNotification({
                    message: SuccessMessages.getMessage(successMessage),
                    variant: 'success',
                    duration: 3000,
                })
            );
    } else if (status !== 200) {
        // 208 - my error code
        dispatch(
            addNotification({
                message: ErrorMessages.getMessage(errorMessage || 'unexpectedError'),
                variant: 'error',
                duration: 3000,
            })
        );
        throw new Error('breakChain');
    } else {
        if (successMessage)
            dispatch(
                addNotification({
                    message: SuccessMessages.getMessage(successMessage),
                    variant: 'success',
                    duration: 3000,
                })
            );

        return jsonBody;
    }
};

const checkError = (Fn, error) => {
    logger.warning('API catch> ' + error, error.stack);
    // if (error.message !== 'breakChain' && Fn)
    if (Fn) Fn(error);
};

function buildParams(params) {
    let result = '?';
    if (params) {
        const toString = ([key, value]) => {
            result += key + '=' + value + '&';
        };
        forEach(toString, toPairs(params));
    }
    return result.slice(0, -1);
}

interface SenderParams {
    url: string;
    token?: string;
    onSuccess?: (data: any) => boolean | any;
    onError?: (err: any) => any;
    onFinish?: () => void;
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'GET';
    dispatch: Dispatch;
    successMessage?: string;
}
type JsonSenderParams = SenderParams & { body?: any };
export const jsonSender = async ({
    url,
    token = '',
    onSuccess,
    onError,
    onFinish,
    method,
    body,
    dispatch,
    successMessage,
}: JsonSenderParams) => {
    let catched = false;
    let successValue = undefined;
    try {
        const response = await fetch(url, {
            method,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });
        const json = await processResponse(dispatch, successMessage)(response);
        if (onSuccess) successValue = onSuccess(json);
    } catch (e) {
        checkError(onError, e);
        catched = true;
    }
    onFinish && onFinish();
    return successValue ?? !catched;
};

export type SenderParam = SenderParams & { params?: any };
export const paramSender = async ({
    url,
    token = '',
    onSuccess,
    onError,
    onFinish,
    method = 'GET',
    dispatch,
    params,
    successMessage,
}: SenderParam) => {
    let catched = false;
    try {
        const response = await fetch(url + (params ? buildParams(params) : ''), {
            method,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        const json = await processResponse(dispatch, successMessage)(response);
        onSuccess(json);
    } catch (e) {
        catched = true;
        checkError(onError, e);
    }
    onFinish && onFinish();
    return !catched;
};

export type SenderJson = Omit<JsonSenderParams, 'method'>;
export const postJson = function (props: SenderJson) {
    return jsonSender({ ...props, method: 'POST' });
};

export const putJson = function (props: SenderJson) {
    return jsonSender({ ...props, method: 'PUT' });
};

export const deleteJson = function (props: SenderJson) {
    return jsonSender({ ...props, method: 'DELETE' });
};

export const patchJson = function (props: SenderJson) {
    return jsonSender({ ...props, method: 'PATCH' });
};

export const getJson = function (props: SenderJson) {
    return jsonSender({ ...props, method: 'GET' });
};
// export const postJson = o(jsonSender, flip(merge)({ method: 'POST' }));

// export const putJson = o(jsonSender, flip(merge)({ method: 'PUT' }));

// export const deleteJson = o(jsonSender, flip(merge)({ method: 'DELETE' }));

// export const patchJson = o(jsonSender, flip(merge)({ method: 'PATCH' }));

// export const getJson = o(jsonSender, flip(merge)({ method: 'GET' }));