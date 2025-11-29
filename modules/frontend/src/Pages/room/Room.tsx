import DoneIcon from '@mui/icons-material/Done';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import { EntityId } from '@reduxjs/toolkit';
import clsx from 'clsx';
import React, { useCallback, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Draggable, DraggableProvider } from '../../components/Draggable';
import { GridRoom } from '../../components/GridRoom';
import { LocationTypography } from '../../components/LocationTypography';
import { useAppDispatch, useAppSelector } from '../../hooks/index';
import { useAppBarContext } from '../../hooks/useAppBarContext';
import { getRoomLocation } from '../../selectors/getters';
import { devicePreferencesReducerActions } from '../../store/slices/preferences/deviceSlice';
import { ThingPreferences, thingPreferencesReducerActions } from '../../store/slices/preferences/thingSlice';
import { byPreferences } from '../../utils/sort';
import { ThingWidget } from './widgets/ThingWidget';

interface RoomContentProps {
    thingIDs: string[];
    editMode: boolean;
    onMove: (dragId: string, hoverId: string) => any;
    preferencies: Record<EntityId, ThingPreferences>
}
function RoomContent({ thingIDs, onMove, editMode, preferencies }: RoomContentProps) {
    return (
        <Grid container justifyContent="center">
            <Grid size={{ xs: 12, md: 7, lg: 6, xl: 5 }}>
                <GridRoom>
                    {thingIDs
                        .map((id) => ({ id: id }))
                        .sort(byPreferences(preferencies))
                        .map(({ id }, idx) => (
                            <Draggable
                                id={id}
                                key={id}
                                index={idx}
                                onMove={onMove}
                                type="thing"
                                dragDisabled={!editMode}
                                render={(isDragable: boolean, ref) =>
                                    <ThingWidget
                                        id={id}
                                        sx={{ opacity: isDragable ? 0.4 : 1 }}
                                        ref={ref}
                                        className={clsx({ floating: editMode })}
                                    />
                                }
                            />
                        ))}
                </GridRoom>
            </Grid>
        </Grid>
    );
}

export interface RoomProps {
    title?: string;
    pathPrefix?: string;
}
export default function Room({ title, pathPrefix }: RoomProps) {
    const { room, building } = useParams() as unknown as { building: string; room: string };
    const dispatch = useAppDispatch();
    const preferencies = useAppSelector((state) => state.preferences.things.entities);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const roomLocation = useAppSelector(getRoomLocation(building, room));
    const { setAppHeader, resetAppHeader } = useAppBarContext();
    const editMode = searchParams.has('edit');

    const IDs = roomLocation?.thingIDs;

    const onMove = useCallback(
        (dragId: string, hoverId: string) => {
            dispatch(thingPreferencesReducerActions.swapOrderFor([dragId, hoverId]));
        },
        [dispatch]
    );

    const prepareEditMode = useCallback(() => {
        if (IDs)
            dispatch(
                devicePreferencesReducerActions.resetOrderFor(
                    IDs.map((id) => ({ id: id }))
                        .sort(byPreferences(preferencies))
                        .map((r) => r.id)
                )
            );
    }, [dispatch, IDs]);

    useEffect(() => {
        return () => resetAppHeader();
    }, []);

    useEffect(() => {
        if (editMode) {
            setAppHeader(
                'Editace',
                <IconButton
                    onClick={() => {
                        navigate({ search: '' }, { replace: true });
                    }}
                >
                    <DoneIcon />
                </IconButton>
            );
            prepareEditMode();
        } else if (title) {
            setAppHeader(title);
        } else resetAppHeader();
    }, [title, editMode, navigate, prepareEditMode]);

    return <DraggableProvider disabled={!editMode}>
        <LocationTypography location={{ building, room }} pathPrefix={pathPrefix} />
        <RoomContent
            thingIDs={IDs || []}
            editMode={editMode}
            onMove={onMove}
            preferencies={preferencies}
        />
    </DraggableProvider>;
}
