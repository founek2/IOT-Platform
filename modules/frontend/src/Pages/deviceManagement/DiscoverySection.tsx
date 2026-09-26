import React from 'react';
import { Grid } from '@mui/material';
import { useState } from 'react';
import {
    CreateDeviceForm,
    useCreateDeviceMutation,
    useDeleteDiscoveryDeviceMutation,
    useDiscoveredDevicesQuery,
} from '../../endpoints/discovery.js';
import { useAppDispatch, useAppSelector } from '../../hooks/index.js';
import { DiscoveredWidget } from '../room/widgets/DiscoveredWidget.js';
import { Dialog } from '../../components/Dialog.js';
import { EditDeviceFields } from './EditDeviceFields.js';
import { locationsSelector } from '../../selectors/locationsSelector.js';
import { getFieldVal } from 'common/utils/getters';
import { formsDataActions } from '../../store/slices/formDataActions.js';
import { useForm } from '../../hooks/useForm.js';
import { discoverySelectors } from '../../store/slices/application/discoverySlice.js';
import { logger } from 'common/logger';

const formName = 'CREATE_DEVICE';
export default function DiscoverySection() {
    const dispatch = useAppDispatch();
    const { validateForm, resetForm } = useForm<CreateDeviceForm>(formName);
    const [selectedDevice, setSelectedDevice] = useState<string>();
    const _ = useDiscoveredDevicesQuery(undefined);
    const discoveredData = useAppSelector((state) => discoverySelectors.selectAll(state.application.discovery));
    const [createDeviceMutation, { isLoading }] = useCreateDeviceMutation();
    const [deleteDeviceMutation, { isLoading: isLoadingDelete }] = useDeleteDiscoveryDeviceMutation();

    const buildings = useAppSelector(locationsSelector);
    const selectedBuildingName = useAppSelector(getFieldVal(`${formName}.info.location.building`)) as string;
    const selectedBuilding = buildings.find((building) => building.name === selectedBuildingName);
    const availableRooms = selectedBuilding ? selectedBuilding.rooms.map((room) => room.name) : [];

    return (
        <>
            <Grid
                container
                justifyContent="center"
                sx={(theme) => ({
                    padding: 2,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))',
                    gap: 2,
                    [theme.breakpoints.up('md')]: {
                        gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))',
                    },
                })}
            >
                {discoveredData.map((device) => (
                    <DiscoveredWidget
                        device={device}
                        key={device._id}
                        onClick={() => {
                            setSelectedDevice(device._id);
                            dispatch(
                                formsDataActions.setFormField({
                                    deepPath: `${formName}.info.name`,
                                    value: discoveredData.find((dev) => dev._id === device._id)?.name || '',
                                })
                            );
                        }}
                    />
                ))}
            </Grid>
            <Dialog
                open={Boolean(selectedDevice)}
                onClose={() => setSelectedDevice(undefined)}
                title="Přidání zařízení"
                disagreeText="Smazat"
                agreeText="Přidat"
                disabled={isLoading || isLoadingDelete}
                onDisagree={() =>
                    selectedDevice &&
                    deleteDeviceMutation({ deviceID: selectedDevice })
                        .unwrap()
                        .then(() => setSelectedDevice(undefined))
                        .catch((err) => logger.error(err))
                }
                onAgree={() => {
                    const result = validateForm();
                    if (result.valid && selectedDevice)
                        createDeviceMutation({ deviceID: selectedDevice, data: result.data })
                            .unwrap()
                            .then(() => {
                                setSelectedDevice(undefined)
                                resetForm()
                            })
                            .catch((err) => console.error(err));
                }}
            >
                <Grid container spacing={2}>
                    <EditDeviceFields
                        formName="CREATE_DEVICE"
                        buildings={buildings.map((m) => m.name)}
                        rooms={availableRooms}
                    />
                </Grid>
            </Dialog>
        </>
    );
}
