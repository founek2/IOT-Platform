import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddCircle from '@mui/icons-material/AddCircle';
import { clone } from 'ramda';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import EditNotify from './editNotifyForm/EditNotify';
import { getFieldVal } from 'common/src/utils/getters';
import { getThing } from '../selectors/getters';
import { Box, CircularProgress, Grid } from '@mui/material';
import { useWebPush } from '../hooks/useWebPush';
import { useForm } from '../hooks/useForm';
import { EditNotificationsFormData } from '../endpoints/thing';
import { useThingNotificationsQuery, useUpdateThingNotificationsMutation } from '../endpoints/thing';
import { transformNotifyForFE } from "common/src/utils/transform"
import { notificationActions } from '../store/slices/notificationSlice';
import SuccessMessages from 'common/src/localization/succcess';
import { logger } from 'common/src/logger';
import { defaultNotifyAdvancedValues } from 'common/src/constants';

const FIELDS: (keyof Omit<EditNotificationsFormData, "count" | "advanced">)[] = ['propertyId', 'type', 'value', 'textTemplate'];
const FIELDS_ADVANCED: (keyof EditNotificationsFormData["advanced"])[] = ['interval', 'from', 'to', 'daysOfWeek'];

export default function EditNotifyPage() {
    const params = useParams<{ deviceId: string; nodeId: string }>();
    const form = useForm<EditNotificationsFormData>("EDIT_NOTIFY", { resetOnUnmount: true })
    const sensorCount = useAppSelector(getFieldVal('EDIT_NOTIFY.count')) || 0;
    const thing = useAppSelector(getThing(params.nodeId));
    const dispatch = useAppDispatch();
    const [subscribeToNotification, { permissionState, unregister }] = useWebPush()
    const { data: currentNotificationRules, isLoading: isLoadingNotifications } = useThingNotificationsQuery({ deviceID: params?.deviceId!, thingID: thing?.config.nodeId! }, { skip: !params.deviceId || !params.nodeId })
    const [updateNotificationMutation, { isLoading: isSaving }] = useUpdateThingNotificationsMutation();

    useEffect(() => {
        async function preFill() {
            if (!currentNotificationRules) return;

            const formData = transformNotifyForFE(currentNotificationRules.properties);
            form.setFormData(formData);
        }
        preFill();

    }, [currentNotificationRules]);

    useEffect(() => {
        return () => form.resetForm();
    }, [])

    function removeSensorByIndex(idx: number) {
        const editForm = form.getFormData();
        const newEditForm = clone(editForm);
        for (let i = idx + 1; i < sensorCount; i++) {
            FIELDS.forEach((key) => {
                if (newEditForm[key]) newEditForm[key][i - 1] = editForm[key][i];
            });
        }
        FIELDS.forEach((key) => {
            if (newEditForm[key] && idx < newEditForm[key].length) newEditForm[key].pop();
        });

        if (newEditForm.advanced) {
            for (let i = idx + 1; i < sensorCount; i++) {
                FIELDS_ADVANCED.forEach((key) => {
                    if (newEditForm.advanced[key]) newEditForm.advanced[key][i - 1] = editForm.advanced[key][i];
                });
            }
            FIELDS_ADVANCED.forEach((key) => {
                if (newEditForm.advanced[key] && idx < newEditForm.advanced[key].length)
                    newEditForm.advanced[key].pop();
            });
        }

        newEditForm.count = sensorCount - 1;
        dispatch(form.setFormData(newEditForm));
    }

    function handleAdd() {
        form.setFieldValue(sensorCount + 1, ['count']);
        form.setFieldValue(defaultNotifyAdvancedValues.interval, ["advanced", "interval", sensorCount]);
        form.setFieldValue(defaultNotifyAdvancedValues.from, ["advanced", "from", sensorCount]);
        form.setFieldValue(defaultNotifyAdvancedValues.to, ["advanced", "to", sensorCount]);
        form.setFieldValue(defaultNotifyAdvancedValues.daysOfWeek, ["advanced", "daysOfWeek", sensorCount]);
        form.setFieldValue("Hodnota je ${value}", ["textTemplate", sensorCount]);
    }

    const handleSave = async () => {
        const { valid, data } = form.validateForm();
        console.log("invalid", data)
        if (!valid || !params.deviceId || !thing?.config.nodeId) return;

        updateNotificationMutation({ deviceId: params.deviceId, nodeId: thing?.config.nodeId, data }).unwrap().then(() => {
            dispatch(notificationActions.add({ message: SuccessMessages.getMessage("successfullyUpdated") }))
        }).catch(err => {
            logger.error(err)
        })
    };


    if (isLoadingNotifications) return <CircularProgress />;
    if (!thing?.config) return <Typography>Nastala chyba</Typography>

    return (
        <Box display="flex" justifyContent="center" >
            <Card sx={{ display: "inline-block", padding: 2 }} >
                <CardHeader titleTypographyProps={{ variant: 'h3', align: "center" }} title="Notifikace" />
                <CardContent >
                    <Grid container flexDirection="column" spacing={5} >

                        {sensorCount > 0 &&
                            [...Array(sensorCount).keys()].map((i) => (
                                <Grid key={i} pb={2}>
                                    <EditNotify id={i} onDelete={removeSensorByIndex} config={thing.config} />
                                </Grid>
                            ))}
                    </Grid>
                    <IconButton aria-label="Add a sensor" onClick={handleAdd} >
                        <AddCircle />
                    </IconButton>
                </CardContent>
                <CardActions >
                    <Button color="secondary" variant="contained" onClick={() => permissionState === "granted" ? unregister() : subscribeToNotification()} disabled={permissionState === "denied"}>
                        {subscribeButtonText(permissionState)}
                    </Button>
                    <Button color="primary" variant="contained" disabled={isSaving} onClick={handleSave}>
                        Uložit
                    </Button>
                    {isSaving ? <CircularProgress /> : null}
                </CardActions>
            </Card>
        </Box >
    )
}

function subscribeButtonText(state: PermissionState | undefined) {
    switch (state) {
        case 'denied':
            return 'Oznámení jsou blokována';
        case 'granted':
            return 'Vypnout oznámení';
        default:
            return 'Přihlásit k odběru'
    }
}