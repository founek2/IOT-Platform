import type { SxProps, Theme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useAppSelector } from '../../../hooks/index.js';
import { getDevice, getThing } from '../../../selectors/getters.js';
import { Link } from 'react-router-dom';
import { ThingContext } from '../../../hooks/useThing.js';
import { ComponentType, PropertyDataType } from 'common/models/interface/thing';
import { Thing } from '../../../store/slices/application/thingsSlice.js';
import { PropertyRowPlain } from '../PropertyRow.js';
import Box from '@mui/material/Box';
import { useUpdateThingStateMutation } from '../../../endpoints/thing.js';
import Circle from '../../../components/OnlineCircle.js';
import { DeviceStatus } from 'common/models/interface/device';
import { useUpdateThingStateSmart } from '../../../hooks/useUpdateThingStateSmart.js';

function getApropriateProperty(config: Thing['config']) {
    if (config.componentType === ComponentType.activator) {
        return config.properties.find((prop) => prop.dataType === PropertyDataType.enum);
    }
    if (config.componentType === ComponentType.switch) {
        return config.properties.find((prop) => prop.dataType === PropertyDataType.boolean);
    }
    if (config.componentType === ComponentType.sensor) {
        return config.properties.find(
            (prop) => prop.dataType === PropertyDataType.float || prop.dataType === PropertyDataType.integer
        );
    }
}

interface ThingWidgetProps {
    id: string;
    sx?: SxProps<Theme>;
    className?: string;
}
export const ThingWidget = React.forwardRef<HTMLDivElement, ThingWidgetProps>(({ id, sx, className }, ref) => {
    const thing = useAppSelector(getThing(id));
    const device = useAppSelector(getDevice(thing?.deviceId!));
    const { mutateThingState } = useUpdateThingStateSmart(id);
    if (!thing || !device) return <span>Zařízení nebo věc nebyla nalezena</span>;

    const appropriateThing = getApropriateProperty(thing.config);
    const disabled = [DeviceStatus.disconnected, DeviceStatus.lost].includes(
        device.state?.status?.value || DeviceStatus.ready
    );

    return (
        <ThingContext.Provider value={thing}>
            <Paper
                className={className}
                elevation={2}
                sx={[
                    {
                        padding: 3,
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'center',
                        flexDirection: 'column',
                    },
                    ...(Array.isArray(sx) ? sx : [sx]),
                ]}
                ref={ref}
            >
                <Circle
                    status={device.state?.status}
                    inTransition={false}
                    sx={{ position: 'absolute', top: 5, right: 5 }}
                />
                <Link to={{ search: `thingId=${thing._id}` }} replace>
                    <Typography
                        sx={{
                            overflow: 'hidden',
                            textAlign: 'center',
                            paddingTop: 1,
                            paddingBottom: 1,
                            opacity: disabled ? 0.6 : 1,
                        }}
                    >
                        {thing.config.name}
                    </Typography>
                </Link>
                {appropriateThing ? (
                    <Box sx={{ display: 'flex', justifyContent: 'inherit' }}>
                        <PropertyRowPlain
                            state={thing.state?.[appropriateThing.propertyId]}
                            property={appropriateThing}
                            disabled={disabled}
                            onChange={(value) =>
                                mutateThingState({
                                    propertyId: appropriateThing.propertyId,
                                    value,
                                })
                            }
                        />
                    </Box>
                ) : null}
            </Paper>
        </ThingContext.Provider>
    );
});
