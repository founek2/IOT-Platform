import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import React, { useEffect, useState } from 'react';
import * as serviceWorker from '../serviceWorkerRegistration.js';

let place_holder = () => console.log('nothing to install');
export function RegisterServiceWorker() {
    const [newVersion, setNewVersion] = useState(false);
    const [forceInstall, setForceInstall] = useState(() => place_holder);

    useEffect(() => {
        const config = {
            onUpdate: function (registration: ServiceWorkerRegistration) {
                // new version available
                setNewVersion(true);
                setForceInstall(() => () => {
                    const installingWorker = registration.waiting;
                    installingWorker?.postMessage({ type: 'SKIP_WAITING' });
                    setNewVersion(false);
                    window.location.reload();
                });
            },
        };
        serviceWorker.register('/service-worker.js', config);
    }, []);

    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        function listener(event: MessageEvent) {
            if (!event.data.action) {
                return;
            }

            switch (event.data.action) {
                case 'redirect-from-notificationclick':
                    window.location.href = event.data.url;
                    break;
            }
        }

        navigator.serviceWorker.addEventListener('message', listener);
        return () => navigator.serviceWorker.removeEventListener('message', listener);
    }, []);

    return (
        <Snackbar
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            open={newVersion}
            message="K dispozici je nová verze"
            action={
                <Button size="small" onClick={forceInstall}>
                    aktualizovat
                </Button>
            }
        />
    );
}
