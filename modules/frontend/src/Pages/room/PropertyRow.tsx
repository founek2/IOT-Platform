import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { CardMedia, Fade, styled, SxProps } from '@mui/material';
import {
    IThingProperty,
    IThingPropertyEnum,
    IThingPropertyNumeric,
    PropertyDataType,
} from 'common/models/interface/thing';
import { isNumericDataType } from 'common/utils/isNumericDataType';
import { numericFormatDiff } from 'common/utils/numericFormatDiff';
import { format } from 'date-fns';
import UpdatedBefore from '../../components/UpdatedBefore.js';
import PlotifyBoolean from '../../components/PlotifyBoolean.js';
import PlotifyNumeric from '../../components/PlotifyNumeric.js';
import { convertBoolHistoryToGraphData, convertNumericHistoryToGraphData } from '../../utils/convertHistoryToGraphData.js';
import React, { forwardRef, useCallback, useState } from 'react';
import { ActivatorButton } from '../../components/ActivatorButton.js';
import { CopyUrlContext } from './helpers/CopyUrl.js';
import { toogleSwitchVal } from './helpers/toogleSwitchVal.js';
import { SensorIcons } from '../../constants/sensorIcons.js';
import { Measurement } from 'common/types';
import type { Theme } from '@mui/material';
import ColorPicker from '../../components/ColorPicker.js';
import { PropertyState } from '../../store/slices/application/thingsSlice.js';
import { CircleComponent } from '../../components/OnlineCircle.js';
import { CircleColors } from '../../utils/getCircleColor.js';
import { VideoStream } from '../../components/VideoStream.js';
import { isUrl } from 'common/utils/isUrl';
import { WebRtcStream } from '../../components/WebRtcStream.js';
import { onEnterRun } from 'common/utils/onEnter';

const ConfirmationCircle = styled(CircleComponent)({
    position: 'absolute',
    right: -24,
    top: 0,
    bottom: 0,
    margin: 'auto',
});

interface PropertyRowPlainProps {
    state?: PropertyState;
    property: IThingProperty;
    onChange: (newValue: string | number) => void;
    disabled?: boolean;
    onDummyClick?: () => any;
}
export function PropertyRowPlain({
    state,
    property,
    onChange,
    disabled: disabledOverride,
    onDummyClick,
}: PropertyRowPlainProps) {
    const value = state?.value;
    const [stateValue, setStateValue] = useState<number | string>(); // TODO rozbije se při příchozí změně z websocketu (desync)
    const disabled = disabledOverride || !property.settable;

    let component: JSX.Element;

    if (property.dataType === PropertyDataType.enum) {
        const propertyEnum = property as IThingPropertyEnum;

        component =
            propertyEnum.format.length === 1 ? (
                <ActivatorButton onClick={() => onChange(propertyEnum.format[0])} disabled={disabled} />
            ) : (
                <Select
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value as string)}
                    variant="standard"
                    disabled={disabled}
                >
                    {(property as IThingPropertyEnum).format.map((label) => (
                        <MenuItem value={label} key={label}>
                            {label}
                        </MenuItem>
                    ))}
                </Select>
            );
    } else if (
        isNumericDataType(property.dataType) &&
        (property as IThingPropertyNumeric).format &&
        property.settable &&
        numericFormatDiff(property as IThingPropertyNumeric) <= 500
    ) {
        const propertyNumeric = property as IThingPropertyNumeric;
        component = (
            <Slider
                sx={{ width: '80px' }}
                onChangeCommitted={(e, newValue) => onChange(newValue as number)}
                value={
                    stateValue !== undefined
                        ? Number(stateValue)
                        : value !== undefined
                        ? Number(value)
                        : propertyNumeric.format?.min
                }
                onChange={(e, newValue) => setStateValue(newValue as number)}
                min={propertyNumeric.format?.min}
                max={propertyNumeric.format?.max}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                disabled={disabled}
            />
        );
    } else if (property.dataType === PropertyDataType.boolean) {
        component = (
            <Switch
                onClick={() => {
                    onChange(toogleSwitchVal(value));
                }}
                checked={value === 'true'}
                disabled={disabled}
            />
        );
    } else if (
        property.dataType === PropertyDataType.binary &&
        property.format?.startsWith('image/') &&
        typeof value === 'string'
    ) {
        component = (
            <CardMedia
                component="img"
                src={`data:${property.format};base64,` + value}
                onClick={onDummyClick}
                sx={{ cursor: onDummyClick ? 'pointer' : undefined }}
            />
        );
    } else if (property.dataType === PropertyDataType.color) {
        component = (
            <ColorPicker
                value={value as string}
                onChange={(e) => {
                    onChange(e.target.value);
                }}
                disabled={disabled}
            />
        );
    } else if (property.dataType === PropertyDataType.string && property.format?.startsWith('image/') && isUrl(value)) {
        component = <CardMedia component="img" src={value as string} />;
    } else if (property.dataType === PropertyDataType.string && property.format?.startsWith('video/') && isUrl(value)) {
        component = <VideoStream src={value as string} />;
    } else if (property.dataType === PropertyDataType.string && property.format?.startsWith('webrtc') && isUrl(value)) {
        component = <WebRtcStream src={value as string} />;
    } else if (property.settable) {
        const isNum = isNumericDataType(property.dataType);
        component = (
            <TextField
                focused={stateValue ? String(stateValue) !== String(value) : undefined}
                value={(stateValue ?? value) || ''}
                inputProps={{ inputMode: isNum ? 'numeric' : 'text', pattern: isNum ? '[0-9]*' : '' }}
                onChange={(e) => setStateValue(isNum ? Number(e.target.value) : e.target.value)}
                onKeyDown={onEnterRun((e: any) => {
                    const val = isNum ? Number(e.target.value) : e.target.value;
                    onChange(val);
                })}
                onBlur={(e) => {
                    const val = isNum ? Number(e.target.value) : e.target.value;
                    if (val === value) return;

                    onChange(val);
                }}
                disabled={disabled}
            />
        );
    } else {
        component = (
            <Typography component="span" sx={disabledOverride ? { opacity: 0.6 } : undefined}>
                {value === undefined ? '-' : value}
            </Typography>
        );
    }
    return (
        <Box display="flex" alignItems="center" position="relative">
            <CopyUrlContext propertyId={property.propertyId} value={value as string}>
                {component}
            </CopyUrlContext>
            {property.unitOfMeasurement ? (
                <Typography
                    component="span"
                    sx={{
                        paddingLeft: property.unitOfMeasurement ? '0.4em' : '0',
                        opacity: disabledOverride ? 0.6 : 1,
                    }}
                >
                    {property.unitOfMeasurement}
                </Typography>
            ) : null}
            <Fade in={state?.inTransition} timeout={{ enter: 1500, exit: 500 }}>
                <ConfirmationCircle color={CircleColors.Orange} title="Čeká se na potvrzení" />
            </Fade>
        </Box>
    );
}

function DetailVisualization({ property, historyData }: { property: IThingProperty; historyData: Measurement[] }) {
    const [selected, setSelected] = useState<number>();

    if (isNumericDataType(property.dataType))
        return <PlotifyNumeric data={[convertNumericHistoryToGraphData(historyData, property.propertyId)]} />;
    if (property.dataType === PropertyDataType.boolean)
        return <PlotifyBoolean data={[convertBoolHistoryToGraphData(historyData, property.propertyId)]} />;

    const data = convertNumericHistoryToGraphData(historyData, property.propertyId);
    return (
        <Box textAlign="center" display="flex" alignItems="center" flexDirection="column" gap={1}>
            {data.x
                .slice(-3)
                .reverse()
                .map((date, i) => {
                    const value = data.y[i];
                    if (
                        property.dataType === PropertyDataType.string &&
                        property.format?.startsWith('video/') &&
                        isUrl(value)
                    )
                        return null;
                    if (
                        property.dataType === PropertyDataType.string &&
                        property.format?.startsWith('webrtc') &&
                        isUrl(value)
                    )
                        return null;

                    if (property.dataType === PropertyDataType.binary && property.format?.startsWith('image/'))
                        return (
                            <Box
                                key={date.getTime()}
                                display="flex"
                                flexDirection="row"
                                gap={2}
                                onClick={() => setSelected(selected === i ? undefined : i)}
                            >
                                <Typography>{format(date, 'd. L. HH:mm')}</Typography>
                                <CardMedia
                                    component="img"
                                    src={`data:${property.format};base64,` + value}
                                    sx={{ maxWidth: selected === i ? 'none' : 50 }}
                                />
                            </Box>
                        );

                    return (
                        <Typography key={date.getTime()}>
                            {format(date, 'd. L. HH:mm')} - {value}
                        </Typography>
                    );
                })}
        </Box>
    );
}

interface PropertyRowProps {
    property: IThingProperty;
    state?: PropertyState;
    timestamp?: Date;
    onChange: (newValue: string | number) => void;
    history?: Measurement[];
    defaultShowDetail?: boolean;
    sx?: SxProps<Theme>;
    className?: string;
    title?: string;
    onDetailClick?: () => any;
}

const PropertyRow = forwardRef<HTMLDivElement, PropertyRowProps>(function PropertyRow(
    { property, state, onChange, history, defaultShowDetail = false, sx, className, title, onDetailClick },
    ref
) {
    const [showDetail, setshowDetail] = useState(defaultShowDetail);
    const toogleDetail = useCallback(() => setshowDetail(!showDetail), [setshowDetail, showDetail]);
    const { propertyClass, name } = property;
    const Icon = propertyClass ? SensorIcons[propertyClass] : null;
    const handleDetail = onDetailClick ? onDetailClick : toogleDetail;

    return (
        <Box sx={sx} ref={ref} className={className}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {Icon ? <Icon onClick={handleDetail} /> : null}
                <Typography component="span" onClick={handleDetail} pr={2} sx={{ cursor: 'pointer' }}>
                    {title || name}
                </Typography>
                <PropertyRowPlain property={property} state={state} onChange={onChange} onDummyClick={handleDetail} />
            </Box>
            {showDetail && state?.timestamp ? (
                <UpdatedBefore
                    gutterBottom
                    time={new Date(state.timestamp)}
                    variant="body2"
                    prefix="Aktualizováno před"
                />
            ) : null}
            {showDetail && history?.some((v) => v.propertyId === property.propertyId) ? (
                <DetailVisualization property={property} historyData={history} />
            ) : null}
        </Box>
    );
});

export default PropertyRow;
