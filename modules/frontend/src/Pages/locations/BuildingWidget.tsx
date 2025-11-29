import type { SxProps, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import clsx from 'clsx';
import React from 'react';
import { Draggable } from '../../components/Draggable';
import { useAppSelector } from '../../hooks';
import { byPreferences } from '../../utils/sort';
import { LocationTypography } from '../../components/LocationTypography';
import RoomWidget from './buildingWidget/RoomWidget';
import { GridLocations } from '../../components/GridLocations';

interface BuildingWidgetProps {
    isDragable?: boolean;
    building: {
        id: string;
        name: string;
        rooms: {
            name: string;
            id: string;
            deviceIDs: string[];
        }[];
    };
    editMode?: 'rooms' | 'buildings';
    editEnabled: boolean;
    isSingle: boolean;
    onMove: (dragId: string, hoverId: string) => any;
    className?: string;
    pathPrefix?: string;
}
export const BuildingWidget = React.forwardRef<HTMLDivElement, BuildingWidgetProps>(
    ({ isDragable, building, editMode, isSingle, onMove, className, editEnabled, pathPrefix }, ref) => {
        const locationPreferences = useAppSelector((state) => state.preferences.locations.entities);

        return (
            <Grid
                size={{ xs: 12, md: 10, lg: 8, xl: 7 }}
                sx={{ opacity: isDragable ? 0.4 : 1, paddingBottom: 2 }}
                className={className}
                ref={ref}
            >
                <LocationTypography location={{ building: building.name }} pathPrefix={pathPrefix} />
                <GridLocations>
                    {building.rooms.sort(byPreferences(locationPreferences)).map((room, idx) => (
                        <Draggable
                            id={room.id}
                            key={room.id}
                            index={idx}
                            onMove={onMove}
                            type={building.name}
                            dragDisabled={!editEnabled || editMode !== 'rooms'}
                            render={(isDragable: boolean, ref) => (
                                <RoomWidget
                                    ref={ref}
                                    deviceIDs={room.deviceIDs}
                                    link={`${building.name}/room/${room.name}`}
                                    sx={{ opacity: isDragable ? 0.4 : 1 }}
                                    className={clsx({ floating: editEnabled && editMode === 'rooms' })}
                                />
                            )}
                        />
                    ))}
                </GridLocations>
            </Grid>
        );
    }
);
