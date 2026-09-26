import { logger } from 'common/logger';
import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '.';
import { UpdateThingStateArgs, useUpdateThingStateMutation } from '../endpoints/thing.js';
import { getThing } from '../selectors/getters.js';
import { Thing, thingsReducerActions } from '../store/slices/application/thingsSlice.js';
import { notificationActions } from '../store/slices/notificationSlice.js';

const SECOND_1 = 1_000;

export function useUpdateThingStateSmart(thingId: Thing['_id']) {
    const [updatePropertyState] = useUpdateThingStateMutation();
    const thing = useAppSelector(getThing(thingId));
    const dispatch = useAppDispatch();
    const ref = useRef<Thing>();

    useEffect(() => {
        ref.current = thing;
    }, [thing]);

    const mutateThingState = useCallback(
        ({
            propertyId,
            value,
        }: {
            propertyId: UpdateThingStateArgs['propertyId'];
            value: UpdateThingStateArgs['value'];
        }) => {
            if (!thing) return logger.error('Thing was not provided');

            // const requestTimestamp = Date.now();
            // const oldValue = thing.state?.[propertyId]?.value;
            updatePropertyState({
                deviceId: thing.deviceId,
                nodeId: thing.config.nodeId,
                thingId: thing._id,
                propertyId,
                value,
            });

            // setTimeout(() => {
            //     if (ref.current?.state) {
            //         const { timestamp, value } = ref.current.state[propertyId] || {};

            //         // Revert value to old when no update recieved within 400ms
            //         if (!timestamp || new Date(timestamp).getTime() < requestTimestamp) {
            //             dispatch(
            //                 thingsReducerActions.updateOneState({
            //                     id: thing._id,
            //                     changes: { [propertyId]: { value: oldValue } },
            //                 })
            //             );
            //             dispatch(
            //                 notificationActions.add({
            //                     message: 'Zařízení nepotvrdilo změnu',
            //                     options: { variant: 'error' },
            //                 })
            //             );
            //         }
            //     }
            // }, SECOND_1);
        },
        [dispatch, updatePropertyState, ref, thing]
    );

    return { mutateThingState };
}
