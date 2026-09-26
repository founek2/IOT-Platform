import { DeviceStatus, IDeviceStatus } from 'common/models/interface/device';
import React, { useState } from 'react';
import getCircleColor, { CircleColors, getCircleTooltipText } from '../utils/getCircleColor.js';
import { format } from '../utils/date-fns.js';
import { grey } from '@mui/material/colors';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import type { SxProps, Theme } from '@mui/material';

const colors = {
    green: 'initial',
    red: '#cd0000',
    orange: '#e08d0f',
    grey: grey[400],
};

type CircleComponentProps = {
    color: CircleColors;
    className?: string;
    sx?: SxProps<Theme>;
    title?: string
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
export const CircleComponent = React.forwardRef(function ({ color, className, sx, title, ...props }: CircleComponentProps, ref: any) {
    return (
        <Tooltip title={title} placement="bottom" arrow={true}>
            <Box
                {...props}
                ref={ref}
                className={className}
                sx={[
                    {
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                    },
                    ...(Array.isArray(sx) ? sx : [sx]),
                ]}
            >
                <Box
                    sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: colors[color],
                    }}
                />
            </Box>
        </Tooltip>
    );
});

interface CircleProps {
    status: IDeviceStatus;
    className?: string;
    inTransition: boolean;
    sx?: SxProps<Theme>;
}
function Circle({ status, className, inTransition, sx }: CircleProps) {
    const [showDate, setShowDate] = useState(false);

    const titleText = status?.timestamp
        ? getCircleTooltipText(inTransition, status.value)
        : 'Zařízení nikdy nebylo připojeno';

    const titleDate = status?.timestamp ? format(new Date(status.timestamp), 'd. L. yyyy H:mm') : '?. ?. ????';

    const title = showDate ? titleDate : titleText;

    return (
        <CircleComponent
            color={getCircleColor(inTransition, status?.value || DeviceStatus.disconnected)}
            className={className}
            onClick={() => setShowDate(!showDate)}
            sx={sx}
            title={title}
        />
    );
}

export default Circle;
