import type { SxProps, Theme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React from 'react';
import { ComponentType, PropertyDataType } from 'common/models/interface/thing';
import { Thing } from '../../../store/slices/application/thingsSlice.js';
import Circle from '../../../components/OnlineCircle.js';
import { DeviceStatus } from 'common/models/interface/device';
import { Discovery } from '../../../endpoints/discovery.js';

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

interface DiscoveredDeviceProps {
    device: Discovery;
    sx?: SxProps<Theme>;
    onClick?: () => any;
}
export const DiscoveredWidget = React.forwardRef<HTMLDivElement, DiscoveredDeviceProps>(
    ({ device, sx, onClick }, ref) => {
        const disabled = [DeviceStatus.disconnected, DeviceStatus.lost].includes(
            device.state?.status?.value || DeviceStatus.ready
        );

        return (
            <Paper
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
                <Typography
                    variant="h4"
                    onClick={onClick}
                    sx={{
                        overflow: 'hidden',
                        textAlign: 'center',
                        paddingTop: 1,
                        paddingBottom: 1,
                        opacity: disabled ? 0.6 : 1,
                        cursor: onClick ? 'pointer' : 'inherit',
                    }}
                >
                    {device.name}
                </Typography>
                <Typography
                    sx={{
                        overflow: 'hidden',
                        textAlign: 'center',
                        paddingTop: 1,
                        paddingBottom: 1,
                        opacity: disabled ? 0.6 : 1,
                    }}
                >
                    {Object.entries(device.things || {})
                        .map(([key, thing]) => thing.config.name)
                        .join(', ')}
                </Typography>
            </Paper>
        );
    }
);
