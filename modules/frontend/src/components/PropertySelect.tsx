import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { IUser } from 'common/src/models/interface/userInterface';
import React, { useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsRemoteIcon from '@mui/icons-material/SettingsRemote';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Device } from '../store/slices/application/devicesSlice';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Grid, SxProps, Theme } from '@mui/material';
import { useAppSelector } from '../hooks';
import { buildingsCachedSelector } from '../selectors/devicesSelector';
import { getDevices, getThings } from '../selectors/getters';
import { notEmpty } from 'common/src/utils/notEmpty';

export interface PropertySelectEvent {
    target: { value: { deviceId: string; thingId: string; propertyId: string } };
}

interface PropertySelectDialogProps {
    onChange: (event: { target: { value: { deviceId: string; thingId: string; propertyId: string } } }) => void;
    sx?: SxProps<Theme>;
}
export function PropertySelect({ onChange, sx = {} }: PropertySelectDialogProps) {
    const devices = useAppSelector(getDevices).entities;
    const things = useAppSelector(getThings).entities;
    const [deviceId, setDeviceId] = useState('');

    const deviceItems = Object.values(devices)
        .filter(notEmpty)
        .map((device) => (
            <ListItemButton onClick={(e) => setDeviceId(device._id)} key={device._id}>
                <ListItemText primary={device.info.name} />
            </ListItemButton>
        ));
    const propertyItems = Object.values(things)
        .filter((thing) => thing?.deviceId === deviceId)
        .filter(notEmpty)
        .flatMap((thing) =>
            thing.config.properties.map((property) => (
                <ListItemButton
                    onClick={(e) =>
                        onChange({ target: { value: { deviceId, propertyId: property._id!, thingId: thing._id } } })
                    }
                    key={property._id}
                >
                    <ListItemText primary={`${property.name} (${thing.config.name})`} />
                </ListItemButton>
            ))
        );

    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
                <List
                    subheader={<ListSubheader>Zařízení</ListSubheader>}
                    sx={[{ bgcolor: 'background.paper', overflow: 'auto' }, ...(Array.isArray(sx) ? sx : [sx])]}
                >
                    {deviceItems}
                </List>
            </Grid>
            <Grid size={{ xs: 6 }}>
                <List
                    subheader={<ListSubheader>Vlastnost</ListSubheader>}
                    sx={[{ bgcolor: 'background.paper', overflow: 'auto' }, ...(Array.isArray(sx) ? sx : [sx])]}
                >
                    {propertyItems}
                </List>
            </Grid>
        </Grid>
    );
}

export default PropertySelect;
