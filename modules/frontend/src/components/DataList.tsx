import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import React, { useState } from 'react';
import SearchField from './fieldConnector/SearchField.js';

function containsText<T>(value: string | undefined, toText: (v: T) => string) {
    return (item: T): boolean => {
        if (!value) return true;

        return toText(item).toLocaleLowerCase().includes(value.toLocaleLowerCase());
    };
}

export interface DataListProps<T extends { _id: string }> {
    data: T[];
    getHumanText: (value: T) => string;
    header?: string;
    onClick?: (value: T) => any;
    searchDisabled?: boolean
}
export default function DataList<T extends { _id: string }>({ data, getHumanText, header, onClick, searchDisabled }: DataListProps<T>) {
    const [value, setValue] = useState('');

    function onSearchChange(e: any) {
        setValue(e.target.value);
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {searchDisabled === false ? <SearchField value={value} label="Hledat" onChange={onSearchChange} sx={{ paddingBottom: 2 }} /> : null}
            <List
                sx={{
                    width: '100%',
                    // maxWidth: 360,
                    // bgcolor: 'background.paper',
                    // color: grey[100],
                    position: 'relative',
                    overflow: 'auto',
                    maxHeight: 500,
                    '& ul': { padding: 0 },
                }}
                subheader={<li />}
            >
                <li>
                    <ul>
                        {header ? <ListSubheader>{header}</ListSubheader> : null}
                        {data.filter(containsText(value, getHumanText)).map((item) => (
                            <ListItem key={`item-${item._id}`} disablePadding>
                                <ListItemButton
                                    disableGutters
                                    onClick={() => {
                                        if (onClick) onClick(item);
                                    }}
                                >
                                    <ListItemText primary={getHumanText(item)} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </ul>
                </li>
            </List>
        </Box>
    );
}
