import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import clsx from 'clsx';
import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Background } from '../components/Background';
import { ContextMenu } from '../components/ContextMenu';
import { Draggable, DraggableProvider } from '../components/Draggable';
import { useAppDispatch, useAppSelector } from '../hooks/index';
import { getRoomLocation } from '../selectors/getters';
import { thingPreferencesReducerActions } from '../store/slices/preferences/thingSlice';
import { byPreferences } from '../utils/sort';
import { LocationTypography } from './buildings/LocationTypography';
import { ThingWidget } from './room/ThingWidget';

interface RoomContentProps {
    thingIDs: string[];
    editMode: boolean;
    onMove: (dragId: string, hoverId: string) => any;
}
function RoomContent({ thingIDs, onMove, editMode }: RoomContentProps) {
    const thingPreferences = useAppSelector((state) => state.preferences.things.entities);
    console.log('editMode', editMode);
    return (
        <Grid container justifyContent="center">
            <Grid item xs={12} md={7} lg={6} xl={5}>
                <Box
                    sx={(theme) => ({
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(8rem, 1fr))',
                        gap: 2,
                        padding: 2,
                        [theme.breakpoints.up('md')]: {
                            gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))',
                        },
                    })}
                >
                    {thingIDs
                        .map((id) => ({ id: id }))
                        .sort(byPreferences(thingPreferences))
                        .map(({ id }, idx) => (
                            <Draggable
                                id={id}
                                key={id}
                                index={idx}
                                onMove={onMove}
                                type="thing"
                                dragDisabled={!editMode}
                                render={(isDragable: boolean, ref) => (
                                    <ThingWidget
                                        id={id}
                                        sx={{ opacity: isDragable ? 0.4 : 1 }}
                                        ref={ref}
                                        className={clsx({ floating: editMode })}
                                    />
                                )}
                            />
                        ))}
                </Box>
            </Grid>
        </Grid>
    );
}

export default function Room() {
    const { room, building } = useParams() as unknown as { building: string; room: string };
    const dispatch = useAppDispatch();
    const thingPreferences = useAppSelector((state) => state.preferences.things.entities);
    const [editMode, setEditMode] = useState(false);
    const roomLocation = useAppSelector(getRoomLocation(building, room));

    const onMove = useCallback(
        (dragId: string, hoverId: string) => {
            dispatch(thingPreferencesReducerActions.swapOrderFor([dragId, hoverId]));
        },
        [dispatch]
    );

    function handleEditMode(onClose: () => any, newState: boolean) {
        return () => {
            onClose();
            const mode = editMode ? false : newState;
            setEditMode(mode);
            if (mode === false) return;
            if (!roomLocation) return;

            dispatch(
                thingPreferencesReducerActions.resetOrderFor(
                    roomLocation.thingIDs
                        .map((id) => ({ id: id }))
                        .sort(byPreferences(thingPreferences))
                        .map((r) => r.id)
                )
            );
        };
    }

    const content = (
        <ContextMenu
            renderMenuItems={(onClose) => (
                <MenuItem onClick={handleEditMode(onClose, !editMode)}>{editMode ? 'Hotovo' : 'Uspořádat'}</MenuItem>
            )}
            render={({ onContextMenu, menuList }) => (
                <Background onContextMenu={onContextMenu}>
                    <LocationTypography location={{ building, room }} showRootSlash={true} />
                    <RoomContent thingIDs={roomLocation?.thingIDs || []} editMode={editMode} onMove={onMove} />
                    {menuList}
                </Background>
            )}
        />
    );

    if (editMode) return <DraggableProvider>{content}</DraggableProvider>;
    return content;
}
