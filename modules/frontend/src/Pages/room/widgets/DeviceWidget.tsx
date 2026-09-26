import type { SxProps, Theme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/index.js';
import { getDevice, getThing } from '../../../selectors/getters.js';
import { Link } from 'react-router-dom';
import Circle from '../../../components/OnlineCircle.js';
import { Device } from '../../../store/slices/application/devicesSlice.js';
import { DialogContentText, Menu, MenuItem } from '@mui/material';
import { useNavigate } from "react-router-dom"
import { useSendDeviceCommandMutation } from '../../../endpoints/devices.js';
import { DeviceCommand } from 'common/models/interface/device';
import { logger } from 'common/logger';
import { notificationActions } from '../../../store/slices/notificationSlice.js';
import { Dialog as MyDialog } from '../../../components/Dialog.js';

interface ThingWidgetProps {
    id: string;
    sx?: SxProps<Theme>;
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>, device: Device) => void //React.MouseEventHandler<HTMLSpanElement>
}
export const DeviceWidget = React.forwardRef<HTMLDivElement, ThingWidgetProps>(({ id, sx, className, onClick }, ref) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLSpanElement>(null);
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const device = useAppSelector(getDevice(id));
    const [sendCommand] = useSendDeviceCommandMutation()
    const [openDialog, setOpenDialog] = useState(false)

    const handleClose = () => {
        setAnchorEl(null);
    };

    if (!device) return <span>Zařízení nebylo nalezeno</span>;

    return (
        <>
            <Paper
                className={className}
                elevation={2}
                sx={[
                    {
                        padding: 3,
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'center',
                        flexDirection: 'column',
                    },
                    ...(Array.isArray(sx) ? sx : [sx]),
                ]}
                ref={ref}
            >
                <Circle
                    status={device.state?.status}
                    inTransition={false}
                    sx={{ position: 'absolute', top: 5, right: 5 }}
                />
                {/* <Link to={{ search: `deviceId=${device._id}` }} replace> */}
                <Typography
                    sx={{
                        overflow: 'hidden',
                        textAlign: 'center',
                        paddingTop: 1,
                        paddingBottom: 1,
                        cursor: "pointer"
                    }}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                    {device.info.name}
                </Typography>
                {/* </Link> */}
            </Paper>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={() => {
                    navigate({ search: `deviceId=${device._id}` }, { replace: true })
                    handleClose()
                }}>Nastavení</MenuItem>
                <MenuItem onClick={() => {
                    sendCommand({ deviceID: device._id, command: DeviceCommand.restart }).unwrap().then(() =>
                        dispatch(notificationActions.add({ message: 'Příkaz odeslán' }))
                    ).catch(err => logger.error("Failed to send command", err))
                    handleClose()
                }}>Restartovat</MenuItem>
                <MenuItem onClick={() => {
                    setOpenDialog(true)
                    handleClose()
                }}>Resetovat</MenuItem>
                <MenuItem onClick={() => {
                    navigate({ search: `deviceId=${device._id}&type=config` }, { replace: true })
                    handleClose()
                }}>Config</MenuItem>
            </Menu>
            <MyDialog
                open={openDialog}
                title="Opravdu chcete zařízení resetovat?"
                onClose={() => setOpenDialog(false)}
                disagreeText="Zrušit"
                onAgree={() => {
                    sendCommand({ deviceID: device._id, command: DeviceCommand.reset }).unwrap().then(() =>
                        dispatch(notificationActions.add({ message: 'Příkaz odeslán' }))
                    ).catch(err => logger.error("Failed to send command", err))
                    setOpenDialog(false)
                }}
            >
                <DialogContentText>Tato akce je nevratná. Pokud je zařízení online, tak bude uvedeno do továrního nastavení.</DialogContentText>
            </MyDialog>
        </>
    );
});
