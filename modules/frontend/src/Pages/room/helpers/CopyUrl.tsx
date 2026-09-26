import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import copy from 'clipboard-copy';
import clsx from 'clsx';
import { logger } from 'common/logger';
import { IThingProperty } from 'common/models/interface/thing';
import React from 'react';
import { useAppSelector } from '../../../hooks/index.js';
import { useLongPress } from '../../../hooks/useLongPress.js';
import { useThing } from '../../../hooks/useThing.js';
import { getDevice } from '../../../selectors/getters.js';

const initialState = {
    mouseX: null,
    mouseY: null,
};

interface CopyUrlContextProps {
    children: JSX.Element | JSX.Element[];
    propertyId: IThingProperty['propertyId'];
    value: string | number;
    className?: string;
}

enum Copy {
    Url,
    Topic,
    Value,
}

export function CopyUrlContext({ children, propertyId, value, className }: CopyUrlContextProps) {
    // const { _id: deviceId, metadata } = useDevice();
    const { config, deviceId } = useThing();
    const device = useAppSelector(getDevice(deviceId));
    const bind = useLongPress(touchClick, mouseClick, 700);

    const [state, setState] = React.useState<{
        mouseX: null | number;
        mouseY: null | number;
    }>(initialState);

    if (!device) {
        logger.error('unable to thing or device in context');
        return null;
    }
    const { metadata } = device;

    function mouseClick(event: React.MouseEvent<HTMLDivElement>) {
        event.preventDefault();

        setState({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
        });
    }

    function touchClick(event: React.TouchEvent<HTMLDivElement>) {
        event.preventDefault();

        setState({
            mouseX: event.touches[0].clientX - 2,
            mouseY: event.touches[0].clientY - 4,
        });
    }

    const handleClose = (action: Copy | boolean = false) => {
        return (e: React.MouseEvent) => {
            e.stopPropagation();
            switch (action) {
                case Copy.Url:
                    const url = `${window.location.origin}/api/v2/realm/${metadata.realm}/device/${metadata.deviceId}/thing/${config.nodeId}?property=${propertyId}&value=${value}`;
                    copy(url);
                    break;
                case Copy.Topic:
                    const topic = `v2/${metadata.realm}/${metadata.deviceId}/${config.nodeId}/${propertyId}`;
                    copy(topic);
                    break;
                case Copy.Value:
                    copy(String(value));
                    break;
            }
            setState(initialState);
        };
    };

    return (
        <div {...bind} onContextMenu={mouseClick} className={clsx(className)}>
            {children}
            <Menu
                keepMounted
                open={state.mouseY !== null}
                onClose={handleClose()}
                anchorReference="anchorPosition"
                anchorPosition={
                    state.mouseY !== null && state.mouseX !== null
                        ? { top: state.mouseY, left: state.mouseX }
                        : undefined
                }
            >
                <MenuItem onClick={handleClose(Copy.Url)}>Kopírovat URL</MenuItem>
                <MenuItem onClick={handleClose(Copy.Topic)}>Kopírovat téma</MenuItem>
                <MenuItem onClick={handleClose(Copy.Value)}>Kopírovat hodnotu</MenuItem>
            </Menu>
        </div>
    );
}
