import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ClearIcon from '@mui/icons-material/Clear';
import { defaultNotifyAdvancedValues, NotifyIntervals } from 'common/src/constants';
import { IThing } from 'common/src/models/interface/thing';
import React, { Fragment, useState } from 'react';
import { useAppSelector } from '../../hooks';
import DaysOfWeekPicker from './DaysOfWeekPicker';
import PropertyPart from './editNotify/PropertyPart';
import { getFieldVal } from 'common/src/utils/getters';
import FieldConnector from '../../components/FieldConnector';

interface EditNotifyProps {
    id: number;
    onDelete: (id: number) => void;
    config: IThing['config'];
}

function EditNotify({ id, onDelete, config }: EditNotifyProps) {
    const [openAdvanced, setOpen] = useState(false);
    const editedAdvanced = useAppSelector((state) => {
        const days = getFieldVal(`EDIT_NOTIFY.advanced.daysOfWeek.${id}`)(state);
        const result =
            getFieldVal(`EDIT_NOTIFY.advanced.to.${id}`)(state) !== defaultNotifyAdvancedValues.to ||
            getFieldVal(`EDIT_NOTIFY.advanced.from.${id}`)(state) !== defaultNotifyAdvancedValues.from ||
            days?.length !== defaultNotifyAdvancedValues.daysOfWeek.length;

        return Boolean(result);
    });

    return (
        <Grid container key={id} spacing={2}>
            <Grid size={{ xs: 12 }} display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel component="legend">Notifikace {id}:</FormLabel>
                <IconButton aria-label="Delete a sensor" onClick={(e) => onDelete(id)} sx={{ marginRight: -1 }}>
                    <ClearIcon />
                </IconButton>
            </Grid>

            <PropertyPart config={config} id={id} />
            {/* <Grid item md={12} xs={12}>
            <FieldConnector
                fieldProps={{
                    type: 'text',
                    multiline: true,
                    fullWidth: true
                }}
                deepPath={`EDIT_NOTIFY.description.${id}`}
            />
        </Grid> */}
            <Grid size={{ md: 12, xs: 12 }}>
                <Typography color="primary" onClick={() => setOpen(!openAdvanced)} sx={{ cursor: "pointer" }} textAlign="center">
                    Rozšířené {editedAdvanced && '⭣'}
                </Typography>
            </Grid>
            {openAdvanced && (
                <Fragment>
                    {/* <div className={classes.contentInner}> */}
                    <Grid size={{ md: 4, xs: 12 }}>
                        <FieldConnector
                            component="Select"
                            deepPath={`EDIT_NOTIFY.advanced.interval.${id}`}
                            options={NotifyIntervals}
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ md: 2, xs: 6 }}>
                        <FieldConnector
                            deepPath={`EDIT_NOTIFY.advanced.from.${id}`}
                            fieldProps={{
                                // defaultValue: "00:00",
                                type: 'time',
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ md: 2, xs: 6 }}>
                        <FieldConnector
                            deepPath={`EDIT_NOTIFY.advanced.to.${id}`}
                            fieldProps={{
                                // defaultValue: "23:59",
                                type: 'time',
                            }}
                            fullWidth
                        />
                    </Grid>
                    {/* </div> */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <FieldConnector
                            deepPath={`EDIT_NOTIFY.advanced.daysOfWeek.${id}`}
                            component={(props) => <DaysOfWeekPicker {...props} />}
                        />
                    </Grid>
                </Fragment>
            )}
        </Grid>
    );
}

export default EditNotify;
