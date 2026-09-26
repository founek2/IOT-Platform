import DoneIcon from '@mui/icons-material/Done';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import clsx from 'clsx';
import { logger } from 'common/logger';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Draggable, DraggableProvider } from '../../components/Draggable.js';
import { useAppDispatch, useAppSelector } from '../../hooks/index.js';
import { useAppBarContext } from '../../hooks/useAppBarContext.js';
import { useEditMode } from '../../hooks/useEditMode.js';
import { Buildings, buildingsCachedSelector } from '../../selectors/devicesSelector.js';
import { useDevicesQuery } from '../../endpoints/devices.js';
import { locationPreferencesReducerActions } from '../../store/slices/preferences/locationSlice.js';
import { byPreferences } from '../../utils/sort.js';
import { BuildingWidget } from './../locations/BuildingWidget.js';
import { EditModeDialog } from './../locations/EditModeDialog.js';

interface DevicesContentProps {
    buildingsData: Buildings;
    editMode?: 'rooms' | 'buildings';
    editEnabled: boolean;
    onMove: (dragId: string, hoverId: string) => any;
    pathPrefix?: string;
}
function DevicesContent({ buildingsData, editMode, onMove, editEnabled, pathPrefix }: DevicesContentProps) {
    const locationPreferences = useAppSelector((state) => state.preferences.locations.entities);

    return (
        <Grid container justifyContent="center">
            {buildingsData.sort(byPreferences(locationPreferences)).map((building, idx) => {
                return (
                    <Draggable
                        id={building.id}
                        key={building.id}
                        index={idx}
                        onMove={onMove}
                        type="building"
                        dragDisabled={!editEnabled || editMode !== 'buildings'}
                        render={(isDragable: boolean, ref) => (
                            <BuildingWidget
                                building={building}
                                isDragable={isDragable}
                                ref={ref}
                                editEnabled={editEnabled}
                                editMode={editMode}
                                onMove={onMove}
                                isSingle={buildingsData.length === 1}
                                className={clsx({ floating: editEnabled && editMode === 'buildings' })}
                                pathPrefix={pathPrefix}
                            />
                        )}
                    />
                );
            })}
        </Grid>
    );
}

interface DevicesProps {
    title?: string;
    pathPrefix?: string;
}
export default function Locations({ title, pathPrefix }: DevicesProps) {
    const dispatch = useAppDispatch();
    const { setAppHeader, resetAppHeader } = useAppBarContext();
    const locationPreferences = useAppSelector((state) => state.preferences.locations.entities);
    const { isLoading } = useDevicesQuery(undefined, { pollingInterval: 10 * 60 * 1000 });
    const { isEditMode, leaveEditMode } = useEditMode();
    const [editMode, setEditMode] = useState<'rooms' | 'buildings' | undefined>(undefined);

    const buildings = useAppSelector(buildingsCachedSelector);
    const { building: selectedBuilding } = useParams<{ building: string }>();
    logger.silly('Rendering Devices...');

    const selectedBuildingData = buildings.find((b) => b.name === selectedBuilding);
    const data = selectedBuildingData ? [selectedBuildingData] : buildings;

    const onMove = useCallback(
        (dragId: string, hoverId: string) => {
            dispatch(locationPreferencesReducerActions.swapOrderFor([dragId, hoverId]));
        },
        [dispatch]
    );

    const prepareEditMode = useCallback(
        (mode: 'rooms' | 'buildings') => {
            if (!data) return;

            if (mode === 'rooms')
                data.forEach((building) => {
                    dispatch(
                        locationPreferencesReducerActions.resetOrderFor(
                            building.rooms.sort(byPreferences(locationPreferences)).map((r) => r.id)
                        )
                    );
                });

            if (mode === 'buildings')
                dispatch(
                    locationPreferencesReducerActions.resetOrderFor(
                        data.sort(byPreferences(locationPreferences)).map((r) => r.id)
                    )
                );
        },
        [dispatch, data]
    );

    useEffect(() => {
        if (isEditMode)
            setAppHeader(
                'Editace',
                <IconButton
                    onClick={() => {
                        leaveEditMode();
                        setEditMode(undefined);
                    }}
                >
                    <DoneIcon />
                </IconButton>
            );
        else if (title) {
            setAppHeader(title);
        } else {
            resetAppHeader();
        }

        return () => resetAppHeader();
    }, [isEditMode, leaveEditMode, title]);

    function handleSelectEditMode(mode: 'buildings' | 'rooms') {
        setEditMode(mode);
        prepareEditMode(mode);
    }

    if (isLoading) return <CircularProgress />;

    return <DraggableProvider disabled={!editMode}>
        <DevicesContent
            buildingsData={data}
            editEnabled={isEditMode}
            editMode={editMode}
            onMove={onMove}
            pathPrefix={pathPrefix}
        />
        <EditModeDialog
            open={isEditMode && !editMode}
            onClose={(v) => (v ? handleSelectEditMode(v) : leaveEditMode())}
        />
    </DraggableProvider>;
}
