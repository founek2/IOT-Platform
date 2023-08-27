import { Dialog as MyDialog } from '../../components/Dialog.js';
import { getFieldVal } from 'common/src/utils/getters.js';
import React, { useEffect, useState } from 'react';
import FieldConnector from '../../components/FieldConnector.js';
import { useAppSelector } from '../../hooks/index.js';
import { useForm } from '../../hooks/useForm.js';
import { locationsSelector } from '../../selectors/locationsSelector.js';
import PermissionSelect from './PermissionSelect.js';
import { Device } from '../../store/slices/application/devicesSlice.js';
import { useUserNamesQuery } from '../../endpoints/users.js';
import { EditDeviceFormData, useDeleteDeviceMutation } from '../../endpoints/devices.js';
import { EditDeviceFields } from './EditDeviceFields.js';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, Grid } from '@mui/material';

const formName = 'EDIT_DEVICE';
interface DeviceFormProps {
    open: boolean;
    onClose: () => any;
    onSave: (data: EditDeviceFormData) => Promise<any>;
    title?: string;
    deviceToEdit?: Device;
}
export function DeviceDialogForm({ open, onClose, title, onSave, deviceToEdit }: DeviceFormProps) {
    const [pending, setPending] = useState(false);
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const { setFieldValue, validateForm, setFormData, resetForm } = useForm<EditDeviceFormData>(formName);
    const { data: userNames } = useUserNamesQuery(undefined, { pollingInterval: 60 * 1000 });
    const buildings = useAppSelector(locationsSelector);
    const selectedBuildingName = useAppSelector(getFieldVal(`${formName}.info.location.building`)) as string;
    const selectedRoomName = useAppSelector(getFieldVal(`${formName}.info.location.room`)) as string;
    const [deleteMutation, { isLoading: isLoadingDelete }] = useDeleteDeviceMutation();

    const selectedBuilding = buildings.find((building) => building.name === selectedBuildingName);
    const availableRooms = selectedBuilding ? selectedBuilding.rooms.map((room) => room.name) : [];
    const isLoading = isLoadingDelete || pending;

    useEffect(() => {
        if (!availableRooms.some((v) => v === selectedRoomName)) setFieldValue('', ['info', 'location', 'room']);
    }, [selectedBuildingName]);

    useEffect(() => {
        if (deviceToEdit)
            setFormData({
                info: {
                    name: deviceToEdit.info.name,
                    location: {
                        room: deviceToEdit.info.location.room,
                        building: deviceToEdit.info.location.building,
                    },
                },
                permissions: deviceToEdit.permissions,
            });

        return () => resetForm();
    }, [deviceToEdit, setFormData, resetForm]);

    async function handleSave() {
        const { valid, data } = validateForm();
        if (valid) {
            setPending(true);
            await onSave(data);
            setPending(false);
        }
    }
    async function handleDelete() {
        if (deviceToEdit?._id)
            deleteMutation({ deviceID: deviceToEdit._id })
                .unwrap()
                .then(() => onClose())
                .catch((err) => console.error(err));
    }

    return (
        <>
            <Dialog open={open} onClose={onClose} title={title}>
                <DialogContent>
                    <Grid container spacing={4}>
                        <EditDeviceFields
                            formName={formName}
                            rooms={availableRooms}
                            buildings={buildings.map((b) => b.name)}
                        />
                        <Grid item xs={12} md={6}>
                            <FieldConnector
                                deepPath={`${formName}.permissions`}
                                // onEnter={onEnter}
                                component={({ label, error, value, onChange }) => (
                                    <PermissionSelect
                                        sx={{ maxHeight: 300 }}
                                        label={label}
                                        error={error}
                                        permissions={value}
                                        onChange={onChange}
                                        userNames={userNames || []}
                                    />
                                )}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirmation(true)} disabled={isLoading} color="secondary">
                        Smazat
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        Uložit
                    </Button>
                </DialogActions>
            </Dialog>
            <MyDialog
                open={openConfirmation}
                title="Opravdu chcete přístupový token odstranit?"
                onClose={() => setOpenConfirmation(false)}
                disagreeText="Zrušit"
                onAgree={() => {
                    setOpenConfirmation(false)
                    handleDelete()
                }}
            >
                <DialogContentText>Tato akce je nevratná a pokud máte token někde použitý, tak ztratíte přístup.</DialogContentText>
            </MyDialog>
        </>
    );
}
