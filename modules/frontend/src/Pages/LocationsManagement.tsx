import React, { useCallback, useEffect, useState } from 'react';
import DoneIcon from '@mui/icons-material/Done';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { useUpdateDeviceMutation } from '../endpoints/devices';
import { getAllDevices, getDevice } from '../selectors/getters';
import { Divider, IconButton, TextField } from '@mui/material';
import { DeviceWidget } from './room/widgets/DeviceWidget';
import { Device } from '../store/slices/application/devicesSlice';
import DiscoverySection from './deviceManagement/DiscoverySection';
import { DeviceDialogForm } from './deviceManagement/DeviceDialogForm';
import { not } from '../utils/ramda';
import { useDispatch } from 'react-redux';
import { devicePreferencesReducerActions } from '../store/slices/preferences/deviceSlice';
import { useAppBarContext } from '../hooks/useAppBarContext';
import { byPreferences } from '../utils/sort';
import { Draggable, DraggableProvider } from '../components/Draggable';
import clsx from 'clsx';
import { DeviceConfigDialog } from './deviceManagement/DeviceConfigDialog';
import { GridRoom } from '../components/GridRoom';

function searchByText(text: string) {
    const search = text.toLowerCase();
    return (device: Device) =>
        device.info.name.toLowerCase().includes(search) ||
        device.metadata.deviceId.toLowerCase().includes(search) ||
        device.info.location.building.toLowerCase().includes(search) ||
        device.info.location.room.toLowerCase().includes(search) ||
        `${device.info.location.building}/${device.info.location.room}`.toLowerCase().startsWith(search);
}

interface DevicesProps {
    title?: string;
}
export default function LocationsManagement({ title }: DevicesProps) {
    const dispatch = useAppDispatch();
    const [searchText, setSearchText] = useState('');
    const [urlSearchParams] = useSearchParams();
    const selectedDevice = useAppSelector(getDevice(urlSearchParams.get('deviceId') || ''));
    const navigate = useNavigate();
    const [updateDevice] = useUpdateDeviceMutation();
    const devices = useAppSelector(getAllDevices);
    const preferencies = useAppSelector((state) => state.preferences.devices.entities);
    const { setAppHeader, resetAppHeader } = useAppBarContext();
    const [searchParams] = useSearchParams();
    const editMode = searchParams.has('edit');

    const onMove = useCallback(
        (dragId: string, hoverId: string) => dispatch(devicePreferencesReducerActions.swapOrderFor([dragId, hoverId])),
        [dispatch]
    );

    const prepareEditMode = useCallback(() => {
        dispatch(
            devicePreferencesReducerActions.resetOrderFor(
                devices
                    .map(({ _id }) => ({ id: _id }))
                    .sort(byPreferences(preferencies))
                    .map((r) => r.id)
            )
        );
    }, [dispatch, devices]);

    useEffect(() => {
        return () => resetAppHeader();
    }, []);

    useEffect(() => {
        if (editMode) {
            setAppHeader(
                'Editace',
                <IconButton
                    onClick={() => {
                        navigate({ search: '' }, { replace: true });
                    }}
                >
                    <DoneIcon />
                </IconButton>
            );
            prepareEditMode();
        } else if (title) {
            setAppHeader(title);
        } else resetAppHeader();
    }, [title, editMode, navigate, prepareEditMode]);

    function closeDialog() {
        navigate({ search: '' }, { replace: true });
    }

    return (
        <>
            <DiscoverySection />
            <Grid container justifyContent="center" sx={{ padding: 2 }}>
                <Grid size={{ xs: 12, md: 7, lg: 6, xl: 5 }}>
                    <TextField
                        variant="standard"
                        label="Vyhledávání"
                        fullWidth
                        sx={{ mt: 1, mb: 2 }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <GridRoom>
                        <DraggableProvider disabled={!editMode}>
                            {devices
                                .filter(searchByText(searchText))
                                .map(({ _id }) => ({ id: _id }))
                                .sort(byPreferences(preferencies))
                                .map(({ id }, idx) => (
                                    <Draggable
                                        id={id}
                                        key={id}
                                        index={idx}
                                        onMove={onMove}
                                        type="device"
                                        dragDisabled={!editMode}
                                        render={(isDragable: boolean, ref) => (
                                            <DeviceWidget
                                                id={id}
                                                key={id}
                                                ref={ref}
                                                sx={{ opacity: isDragable ? 0.4 : 1 }}
                                                className={clsx({ floating: editMode })}
                                            />
                                        )}
                                    />
                                ))}
                        </DraggableProvider>
                    </GridRoom>
                </Grid>
            </Grid>
            <DeviceDialogForm
                title={selectedDevice?.info.name}
                open={Boolean(selectedDevice) && !searchParams.has('type')}
                onClose={closeDialog}
                deviceToEdit={selectedDevice}
                onSave={async (data) => {
                    if (!selectedDevice) return;

                    const result = await updateDevice({ deviceID: selectedDevice._id, data });
                    if (not('error' in result)) closeDialog();
                }}
            />
            <DeviceConfigDialog
                open={Boolean(selectedDevice) && searchParams.has('type')}
                device={selectedDevice}
                onClose={closeDialog}
            />
        </>
    );
}
