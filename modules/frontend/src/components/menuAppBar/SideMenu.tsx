import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import uiMessages, { UiMessageKey } from 'common/src/localization/uiMessages';
import { RouteMenu } from 'common/src/privileges';
import React from 'react';
import { Link, Location, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import { getCurrentGroups } from '../../selectors/getters';
import { privileges } from '../../services/privileges';

function externalRedirect(path: string) {
    return (e: any) => {
        if (!path.startsWith('http')) return;

        e.preventDefault();
        window.open(path, '_blank');
    };
}

function createMenuListItem({ path, name, Icon }: RouteMenu, location: Location) {
    return (
        <Link to={path} key={path} onClick={externalRedirect(path)}>
            <ListItem disablePadding>
                <ListItemButton selected={location.pathname === path}>
                    <ListItemIcon>
                        <Icon />
                    </ListItemIcon>
                    <ListItemText primary={uiMessages.getMessage(name)} />
                    {path.startsWith('http') ? <ListItemIcon >
                        <OpenInNewIcon fontSize='small' color='disabled' />
                    </ListItemIcon> : null}
                </ListItemButton>
            </ListItem>
        </Link>
    );
}

export interface SideMenuProps {
    open: boolean;
    onClose: (event: React.KeyboardEvent | React.MouseEvent) => any;
    onOpen: (event: React.KeyboardEvent | React.MouseEvent) => any;
}
export function SideMenu({ open, onClose, onOpen }: SideMenuProps) {
    const userGroups = useAppSelector(getCurrentGroups);
    const location = useLocation();

    return (
        <SwipeableDrawer anchor="left" open={open} onClose={onClose} onOpen={onOpen} disableSwipeToOpen>
            <Box sx={{ width: 250 }} role="presentation" onClick={onClose} onKeyDown={onClose}>
                <List
                    subheader={
                        <ListSubheader component="div" id="nested-list-subheader">
                            Menu
                        </ListSubheader>
                    }
                >
                    {privileges.getMenuPaths(userGroups).map((item) => createMenuListItem(item, location))}
                </List>
                <Divider />
                <List>
                    {[{ path: '/registration', name: 'registration' as UiMessageKey, Icon: AccountCircleIcon }].map(
                        (item) => createMenuListItem(item, location)
                    )}
                </List>
            </Box>
        </SwipeableDrawer>
    );
}
