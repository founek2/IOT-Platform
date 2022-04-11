import { paramSender, patchJson } from 'framework-ui/lib/api';

const API_URL = '/api';

export const fetchHistory = ({ deviceId, thingId, ...object }: any, dispatch: any) =>
    paramSender({
        url: API_URL + '/device/' + deviceId + '/thing/' + thingId + '/history',
        ...object,
        dispatch,
    });

export const updateState = ({ deviceId, nodeId, ...object }: any, dispatch: any) =>
    patchJson({
        url: API_URL + '/device/' + deviceId + '/thing/' + nodeId,
        ...object,
        dispatch,
    });
