import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import ChairIcon from '@mui/icons-material/Chair';
import { ListItemButton } from '@mui/material';

export interface EditModeDialogProps {
    open: boolean;
    onClose: (value: 'rooms' | 'buildings' | undefined) => void;
}

export function EditModeDialog({ open, onClose }: EditModeDialogProps) {
    return (
        <Dialog onClose={() => onClose(undefined)} open={open}>
            <DialogTitle>Zvolte co budete uspořádávat</DialogTitle>
            <List sx={{ pt: 0 }}>
                <ListItemButton onClick={() => onClose('rooms')}>
                    <ListItemIcon>
                        <ChairIcon />
                    </ListItemIcon>
                    <ListItemText primary="Místnosti" />
                </ListItemButton>
                <ListItemButton onClick={() => onClose('buildings')}>
                    <ListItemIcon>
                        <HomeIcon />
                    </ListItemIcon>
                    <ListItemText primary="Budovy" />
                </ListItemButton>
            </List>
        </Dialog>
    );
}
