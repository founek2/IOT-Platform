import { CircularProgress } from '@mui/material';
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Dialog } from '../components/Dialog';
import { useDevicesQuery, useUpdateDeviceMutation } from '../endpoints/devices';
import { useAppDispatch, useAppSelector } from '../hooks/index';
import { getDevice } from '../selectors/getters';
import { formsDataActions } from '../store/slices/formDataActions';
import { not } from '../utils/ramda';
import { DeviceDialogForm } from './deviceManagement/DeviceDialogForm';
import Room from './room/Room';

interface DeviceManagementProps {
    title?: string;
}
export default function DeviceManagement({ title }: DeviceManagementProps) {
    const { isLoading } = useDevicesQuery(undefined, { pollingInterval: 1 * 60 * 1000 });
    const [urlSearchParams] = useSearchParams();
    const selectedDevice = useAppSelector(getDevice(urlSearchParams.get('deviceId') || ''));
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [updateDevice, result] = useUpdateDeviceMutation();

    useEffect(() => {
        if (selectedDevice) {
            dispatch(
                formsDataActions.setFormData({
                    formName: 'EDIT_DEVICE',
                    data: {
                        info: {
                            name: selectedDevice.info.name,
                            location: {
                                room: selectedDevice.info.location.room,
                                building: selectedDevice.info.location.building,
                            },
                        },
                        permissions: selectedDevice.permissions,
                    },
                })
            );
        }
    }, [selectedDevice, dispatch]);

    function closeDialog() {
        navigate({ search: '' }, { replace: true });
    }
    return (
        <>
            {isLoading ? <CircularProgress /> : <Room title={title} mode="devices" />}
            <DeviceDialogForm
                title={selectedDevice?.info.name}
                open={Boolean(selectedDevice)}
                onClose={closeDialog}
                onSave={async (data) => {
                    if (!selectedDevice) return;

                    const result = await updateDevice({ deviceID: selectedDevice._id, data });
                    if (not('error' in result)) closeDialog();
                }}
            />
        </>
    );
}
