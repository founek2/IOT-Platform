import { MenuItem } from '@mui/material';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Dialog } from '../../components/Dialog.js';
import { Draggable, DraggableProvider } from '../../components/Draggable.js';
import { useLazyThingHistoryQuery, useUpdateThingMutation } from '../../endpoints/thing.js';
import { useAppDispatch, useAppSelector } from '../../hooks/index.js';
import { ThingContext } from '../../hooks/useThing.js';
import { useUpdateThingStateSmart } from '../../hooks/useUpdateThingStateSmart.js';
import { getThing } from '../../selectors/getters.js';
import { thingsReducerActions } from '../../store/slices/application/thingsSlice.js';
import { notificationActions } from '../../store/slices/notificationSlice.js';
import PropertyRow from '.././room/PropertyRow.js';


export function ThingDialog() {
    const [editMode, setEditMode] = useState(false);
    const [thingDirty, setThingDirty] = useState(false);
    const [urlSearchParams] = useSearchParams();
    const thingId = urlSearchParams.get('thingId') || '';
    const thing = useAppSelector(getThing(thingId));
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { mutateThingState } = useUpdateThingStateSmart(thingId);
    const [mutateThing] = useUpdateThingMutation();



    function onMove(dragId: string, hoverId: string) {
        setThingDirty(true);
        dispatch(thingsReducerActions.swapPropertyOrderFor([thingId, dragId, hoverId]));
    }

    async function handleClose() {
        if (thingDirty && thing) {
            await mutateThing({
                deviceId: thing.deviceId,
                nodeId: thing._id,
                data: {
                    config: thing.config,
                },
            })
                .unwrap()
                .then(() => {
                    setEditMode(false);
                    setThingDirty(false);
                    dispatch(notificationActions.add({ message: 'Změna byla uložena' }));
                })
                .catch((err) => console.log(err));
        }
        navigate({ search: '' }, { replace: true });
    }

    const content = thing ? (
        thing.config.properties.map((property, i) => (
            <Draggable
                id={property._id!}
                key={property._id!}
                index={i}
                onMove={onMove}
                type="property"
                dragDisabled={!editMode}
                render={(isDragable: boolean, ref) => (
                    <ThingContext.Provider value={thing} key={property._id}>
                        <PropertyRow
                            ref={ref}
                            sx={{ paddingBottom: 2, sx: isDragable ? 0.4 : 1 }}
                            className={clsx({ floating: editMode })}
                            key={property.propertyId}
                            property={property}
                            state={thing.state?.[property.propertyId]}
                            onChange={(value) => {
                                mutateThingState({
                                    propertyId: property.propertyId,
                                    value,
                                });
                            }}
                            historyQuery={{ deviceID: thing.deviceId, thingID: thing._id, propertyId: property.propertyId }}
                            defaultShowDetail={i === 0}
                        />
                    </ThingContext.Provider>
                )}
            />
        ))
    ) : (
        <></>
    );

    const menu = [
        { label: 'Uspořádat', onClick: () => setEditMode(!editMode) },
        { label: 'Notifikace', path: `/device/${thing?.deviceId}/thing/${thingId}/notification` },
    ];
    return (
        <Dialog
            open={Boolean(thing)}
            onClose={() => handleClose()}
            title={thing?.config.name}
            menuItems={(closeMenu) =>
                menu.map(({ label, path, onClick }) => {
                    const item = (
                        <MenuItem
                            key={label}
                            onClick={() => {
                                closeMenu();
                                if (onClick) onClick();
                            }}
                        >
                            {label}
                        </MenuItem>
                    );
                    return path ? (
                        <Link key={label} to={path}>
                            {item}
                        </Link>
                    ) : (
                        item
                    );
                })
            }
            fullWidth
        >
            <>{<DraggableProvider disabled={!editMode}>{content}</DraggableProvider>}</>
        </Dialog>
    );
}
