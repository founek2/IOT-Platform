import { DialogContentText, Typography } from '@mui/material';
import React from 'react';
import { Dialog as MyDialog } from '../../components/Dialog.js';
import { useAppSelector } from '../../hooks/index.js';
import { getThingsById } from '../../selectors/getters.js';
import { Device } from '../../store/slices/application/devicesSlice.js';

type JSONValue = string | number | boolean | JSONObject | JSONArray;

interface JSONObject {
    [x: string]: JSONValue;
}

interface JSONArray extends Array<JSONValue> {}

function isNative(val: any) {
    return typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean';
}

function toSpaces(val: string) {
    return ' '.repeat(val.length);
}

function convertJsonToYamlHtml(data: JSONValue, prefix = '', uniqKey = 'device'): JSX.Element {
    const items: JSX.Element[] = [];
    if (Array.isArray(data)) {
        data.forEach((value, idx) => {
            items.push(convertJsonToYamlHtml(value, prefix + ' - ', `${uniqKey}.${idx}`));
        });
    } else if (typeof data === 'object') {
        let first = true;
        Object.entries(data).forEach(([key, value]) => {
            if (key === '_id') return;
            const reactKey = `${uniqKey}.${key}`;

            items.push(
                <Typography component="span" key={`${reactKey}`}>
                    {first ? prefix : toSpaces(prefix)}
                    {key}:{' '}
                </Typography>
            );
            if (!isNative(value)) items.push(<br key={reactKey + 'bro'} />);
            items.push(convertJsonToYamlHtml(value, isNative(value) ? '' : toSpaces(prefix) + '   ', reactKey));
            first = false;
        });
    } else if (isNative(data)) {
        items.push(
            <Typography component="span" key={uniqKey + 'v'}>
                {prefix}
                {data.toString()}
            </Typography>
        );
        items.push(<br key={uniqKey + 'brv'} />);
    }

    return <React.Fragment key={uniqKey + 'fr'}>{items}</React.Fragment>;
}

interface DeviceConfigDialogProps {
    open: boolean;
    onClose: () => void;
    device?: Device;
}
export function DeviceConfigDialog({ open, onClose, device }: DeviceConfigDialogProps) {
    const things = useAppSelector(getThingsById(device?.things || []));
    if (!device) return null;

    return (
        <MyDialog open={open} title="Konfigurace zařízení v podobě yaml" onClose={onClose} disagreeText="Zavřít">
            <DialogContentText sx={{ whiteSpace: 'pre' }}>
                {convertJsonToYamlHtml({
                    info: device.info,
                    metadata: device.metadata,
                    things: things.map((t) => t.config),
                } as any)}
            </DialogContentText>
        </MyDialog>
    );
}
