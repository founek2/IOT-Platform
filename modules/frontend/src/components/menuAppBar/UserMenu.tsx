import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/index.js';
import { authorizationActions } from '../../store/slices/application/authorizationActions.js';
import { preferencesActions } from '../../store/slices/preferences/setting.js';
import { getColorMode, getCurrentUserId, getCurrentUserName } from '../../selectors/getters.js';
import { useNavigate } from 'react-router-dom';
import { useSignOutMutation } from '../../endpoints/signOut.js';
import { notificationActions } from '../../store/slices/notificationSlice.js';
import SuccessMessages from 'common/localization/succcess';

export function UserMenu() {
    const userName = useAppSelector(getCurrentUserName);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const dispatch = useAppDispatch();
    const open = Boolean(anchorEl);
    const colorMode = useAppSelector(getColorMode);
    const navigate = useNavigate();
    const [signOutMutation] = useSignOutMutation()

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleSignOut = () => {
        signOutMutation();
        dispatch(authorizationActions.signOut());
        handleClose();
        dispatch(notificationActions.add({ message: SuccessMessages.getMessage("successfullySignedOut") }))
    };
    const handleColorModeChange = () => {
        dispatch(preferencesActions.setColorMode(colorMode === 'light' ? 'dark' : 'light'));
        handleClose();
    };
    const handleEditMode = () => {
        navigate({ search: '?edit=true' });
        handleClose();
    };
    const handleEditUser = () => {
        navigate("/profile");
        handleClose();
    };

    return (
        <>
            <Button onClick={handleClick} color="inherit">
                {userName}
            </Button>
            <Menu
                id="user-positioned-menu"
                aria-labelledby="user-positioned-button"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <MenuItem onClick={handleEditUser}>Účet</MenuItem>
                <MenuItem onClick={handleEditMode}>Uspořádat</MenuItem>
                <MenuItem onClick={handleColorModeChange}>
                    <Typography>{colorMode === 'light' ? 'Tmavý' : 'Světlý'}</Typography>
                    <ListItemIcon sx={{ justifyContent: 'flex-end' }}>
                        {colorMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                    </ListItemIcon>
                </MenuItem>
                <MenuItem onClick={handleSignOut}>Odhlásit</MenuItem>
            </Menu>
        </>
    );
}
