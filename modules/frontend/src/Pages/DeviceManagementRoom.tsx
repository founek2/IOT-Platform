import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDevicesQuery, useUpdateDeviceMutation } from '../endpoints/devices.js';
import { useAppSelector } from '../hooks/index.js';
import { getDevice } from '../selectors/getters.js';
import { not } from '../utils/ramda.js';
import { DeviceDialogForm } from './deviceManagement/DeviceDialogForm.js';
import Room from './room/Room.js';

interface DeviceManagementProps {
    title?: string;
}
export default function DeviceManagement({ title }: DeviceManagementProps) {
    const { isLoading } = useDevicesQuery(undefined, { pollingInterval: 1 * 60 * 1000 });
    const [urlSearchParams] = useSearchParams();
    const selectedDevice = useAppSelector(getDevice(urlSearchParams.get('deviceId') || ''));
    const navigate = useNavigate();
    const [updateDevice] = useUpdateDeviceMutation();

    function closeDialog() {
        navigate({ search: '' }, { replace: true });
    }
    return (
        <>
            {isLoading ? <CircularProgress /> : <Room title={title} pathPrefix="/management" />}
            <DeviceDialogForm
                title={selectedDevice?.info.name}
                open={Boolean(selectedDevice)}
                onClose={closeDialog}
                deviceToEdit={selectedDevice}
                onSave={async (data) => {
                    if (!selectedDevice) return;

                    const result = await updateDevice({ deviceID: selectedDevice._id, data });
                    if (not('error' in result)) closeDialog();
                }}
            />
        </>
    );
}
