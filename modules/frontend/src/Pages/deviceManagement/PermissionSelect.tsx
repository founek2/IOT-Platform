import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { IUser } from 'common/models/interface/userInterface';
import React, { useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsRemoteIcon from '@mui/icons-material/SettingsRemote';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Device } from '../../store/slices/application/devicesSlice.js';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import type { SxProps, Theme } from '@mui/material';

function getIcon(userId: IUser['_id'], permissions: Device['permissions']) {
    const isRead = permissions.read.some((id) => id === userId);
    const isControl = permissions.control.some((id) => id === userId);
    const isWrite = permissions.write.some((id) => id === userId);

    return isRead && isControl && isWrite ? (
        <SettingsIcon />
    ) : isRead && isControl ? (
        <SettingsRemoteIcon />
    ) : isRead ? (
        <MenuBookIcon />
    ) : null;
}

type UserName = {
    _id: string;
    userName: string;
};

const createListItem =
    (clickHandler: (e: any, id: IUser['_id']) => void, permissions: Device['permissions']) => (obj: UserName) => {
        return (
            <ListItemButton onClick={(e) => clickHandler(e, obj._id)} key={obj._id}>
                <ListItemText primary={obj.userName} />
                <ListItemIcon>{getIcon(obj._id, permissions)}</ListItemIcon>
            </ListItemButton>
        );
    };

interface PermissionSelectProps {
    label: string;
    error: boolean;
    permissions?: Device['permissions'];
    onChange: (permissions: { target: { value: Device['permissions'] } }) => void;
    userNames: { _id: string; userName: string }[];
    sx?: SxProps<Theme>;
}
export function PermissionSelect({
    label,
    error,
    permissions = { read: [], write: [], control: [] },
    onChange,
    userNames,
    sx = {},
}: PermissionSelectProps) {
    const [ancholEl, setAnchorEl] = useState(null);
    const [userId, setUserId] = useState('');
    function handleClick(e: any, id: IUser['_id']) {
        setAnchorEl(e.currentTarget);
        setUserId(id);
    }
    function reset() {
        setAnchorEl(null);
        setUserId('');
    }

    function handlePermissionClick(permission?: 'read' | 'write' | 'control') {
        reset();
        let perms = {
            read: permissions.read.filter((id) => id !== userId),
            control: permissions.control.filter((id) => id !== userId),
            write: permissions.write.filter((id) => id !== userId),
        };

        if (permission === 'read') {
            perms.read = [...perms.read, userId];
        } else if (permission === 'control') {
            perms.read = [...perms.read, userId];
            perms.control = [...perms.control, userId];
        } else if (permission === 'write') {
            perms.read = [...perms.read, userId];
            perms.control = [...perms.control, userId];
            perms.write = [...perms.write, userId];
        }

        onChange({ target: { value: perms } });
    }

    const listItems = userNames.map(createListItem(handleClick, permissions));

    return (
        <>
            <List
                subheader={<ListSubheader>{label}</ListSubheader>}
                sx={[{ bgcolor: 'background.paper', overflow: 'auto' }, ...(Array.isArray(sx) ? sx : [sx])]}
            >
                {listItems}
            </List>
            <Menu id="menu-appbar" anchorEl={ancholEl} open={Boolean(ancholEl)} onClose={reset}>
                <MenuItem onClick={() => handlePermissionClick('read')}>Čtení</MenuItem>
                <MenuItem onClick={() => handlePermissionClick('control')}>Ovládání</MenuItem>
                <MenuItem onClick={() => handlePermissionClick('write')}>Správa</MenuItem>
                <MenuItem onClick={() => handlePermissionClick()}>Žádné</MenuItem>
            </Menu>
        </>
    );
}

export default PermissionSelect;
