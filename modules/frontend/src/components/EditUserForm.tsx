import Grid from '@mui/material/Grid';
import React from 'react';
import { useAppSelector } from '../hooks';
import { getCurrentGroups } from '../selectors/getters';
import FieldConnector from './FieldConnector';
import { privileges } from '../services/privileges';

interface UserFormProps {
    formName: 'REGISTRATION' | 'EDIT_USER';
    onEnter?: React.EventHandler<any>;
    editGroups?: boolean;
}
function EditUserForm({ formName, onEnter, editGroups }: UserFormProps) {
    const groups = useAppSelector(getCurrentGroups);

    return (
        <Grid container spacing={3}>
            <Grid size={{ md: 6, xs: 12 }}>
                <FieldConnector deepPath={`${formName}.info.firstName`} fullWidth />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
                <FieldConnector deepPath={`${formName}.info.lastName`} fullWidth />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
                <FieldConnector deepPath={`${formName}.info.userName`} fullWidth />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
                <FieldConnector
                    fieldProps={{
                        type: 'email',
                    }}
                    fullWidth
                    deepPath={`${formName}.info.email`}
                />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
                <FieldConnector
                    component="PasswordField"
                    deepPath={`${formName}.auth.password`}
                    onEnter={onEnter}
                    fullWidth
                />
            </Grid>
            {editGroups ? (
                <Grid size={{ xs: 12 }}>
                    <FieldConnector
                        deepPath={`${formName}.groups`}
                        component="ChipArray"
                        fullWidth
                        options={privileges
                            .getAllowedGroups(groups)
                            .map(({ text, name }) => ({ value: name, label: text }))}
                    />
                </Grid>
            ) : null}
        </Grid>
    );
}

export default EditUserForm;
