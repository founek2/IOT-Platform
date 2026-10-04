import { FormControlLabel, Grid, Switch, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { VIRTUAL_DEVICE_NODE_ID, VIRTUAL_DEVICE_PROPERTY_ID } from '../../components/VirtualDevice.js';
import { useWebMqttUrlQuery } from '../../endpoints/config.js';
import { useAppDispatch, useAppSelector } from '../../hooks/index.js';
import { getCurrentUser, getVirtualDevice } from '../../selectors/getters.js';
import { pluginsReducerActions } from '../../store/slices/pluginsSlice.js';
import { generateDeviceId } from '../../utils/generateDeviceId.js';

function Device() {
    const { enabled, name } = useAppSelector(getVirtualDevice);
    const realm = useAppSelector(getCurrentUser)?.realm;
    const dispatch = useAppDispatch();
    const [draftName, setDraftName] = useState(name);
    const deviceId = generateDeviceId();
    const { data: mqttUrl, isSuccess } = useWebMqttUrlQuery();

    function saveName() {
        const trimmed = draftName.trim();
        if (trimmed && trimmed !== name) dispatch(pluginsReducerActions.updateVirtualDevice({ name: trimmed }));
        else setDraftName(name);
    }

    return (
        <Grid container direction="column" spacing={2} maxWidth={500} width="100%">
            <Grid>
                <FormControlLabel
                    control={
                        <Switch
                            checked={enabled}
                            onChange={(e) => dispatch(pluginsReducerActions.updateVirtualDevice({ enabled: e.target.checked }))}
                        />
                    }
                    label="Ovladatelné zařízení"
                />
                <Typography variant="body2" color="textSecondary">
                    Toto zařízení se připojí k platformě jako IoT zařízení a umožní automatizacím otevírat detail věci.
                    Po zapnutí jej spárujte v přehledu nalezených zařízení.
                </Typography>
                {isSuccess && !mqttUrl ? (
                    <Typography variant="body2" color="error">
                        Server nemá nastavenou adresu pro připojení zařízení z prohlížeče (WEB_MQTT_URL).
                    </Typography>
                ) : null}
            </Grid>
            <Grid>
                <TextField
                    label="Název zařízení"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onBlur={saveName}
                    fullWidth
                />
            </Grid>
            <Grid>
                <Typography variant="body2">ID zařízení: {deviceId}</Typography>
                {enabled && realm ? (
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        Topic pro otevření věci: v2/{realm}/{deviceId}/{VIRTUAL_DEVICE_NODE_ID}/{VIRTUAL_DEVICE_PROPERTY_ID}/set
                    </Typography>
                ) : null}
            </Grid>
        </Grid>
    );
}

export default Device;
