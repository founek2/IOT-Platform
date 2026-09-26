import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SnackbarKey, useSnackbar } from 'notistack';
import { notificationActions } from '../store/slices/notificationSlice.js';
import { getNotifications } from '../selectors/getters.js';

export function NotificationReduxConnect() {
    const [displayed, setDisplayed] = useState<SnackbarKey[]>([]);
    const dispatch = useDispatch();
    const notifications = useSelector(getNotifications);

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const storeDisplayed = (id: SnackbarKey) => {
        setDisplayed([...displayed, id]);
    };

    const removeDisplayed = (id: SnackbarKey) => {
        setDisplayed([...displayed.filter((key) => id !== key)]);
    };

    React.useEffect(() => {
        notifications.forEach(({ message, options: { key, autoHideDuration = 3000, onExited, persist, variant } }) => {
            // do nothing if snackbar is already displayed
            if (displayed.includes(key)) return;

            // display snackbar using notistack
            enqueueSnackbar(message as string, {
                key,
                autoHideDuration,
                onExited: (event, myKey) => {
                    // removeDisplayed(myKey);
                    if (typeof onExited === 'function') onExited(event, myKey);
                    // closeSnackbar(key);
                },
                persist,
                variant,
            });

            // keep track of snackbars that we've displayed
            storeDisplayed(key);

            // remove this snackbar from redux store - Trying to get rid of persistenting notifications
            dispatch(notificationActions.remove(key));
        });
    }, [notifications, closeSnackbar, enqueueSnackbar, dispatch]);

    return null;
}
