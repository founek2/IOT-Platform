import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { IThingProperty } from 'common/models/interface/thing';
import React from 'react';
import { SensorIcons } from '../../../constants/sensorIcons.js';
import { Thing } from '../../../store/slices/application/thingsSlice.js';

type IThingPropertyWithDeviceClass = IThingProperty & { propertyClass: NonNullable<IThingProperty['propertyClass']> };
interface SimpleSensorProps {
    value: any;
    property: IThingPropertyWithDeviceClass;
}
export function SimpleSensor({ value, property }: SimpleSensorProps) {
    const Icon = SensorIcons[property.propertyClass];

    if (!value) return null;

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingLeft: "0.3rem",
                paddingRight: "0.3rem"
            }}
        >
            <Icon />
            <Typography component="span">
                {value}&nbsp;{property.unitOfMeasurement}
            </Typography>
        </Box>
    );
}
