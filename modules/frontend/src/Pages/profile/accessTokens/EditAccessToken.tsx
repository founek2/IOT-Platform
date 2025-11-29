import { Grid, List, ListItem, ListItemButton, MenuItem } from '@mui/material';
import { IAccessToken, Permission } from 'common/src/models/interface/userInterface';
import { pick } from 'ramda';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { compose } from '@reduxjs/toolkit';
import FieldConnector from '../../../components/FieldConnector';
import { TokenPermissions } from '../../../constants';
import { AccessToken } from '../../../endpoints/accessTokens';
import { formsDataActions } from '../../../store/slices/formDataActions';

interface DiscoverySectionProps {
    formName: 'EDIT_ACCESS_TOKEN' | 'ADD_ACCESS_TOKEN';
    accessToken?: AccessToken;
}

function EditDeviceForm({ formName, accessToken }: DiscoverySectionProps) {
    const dispatch = useDispatch();

    useEffect(() => {
        function fillForm(data: any) {
            dispatch(formsDataActions.setFormData({ formName, data }));
        }
        if (accessToken) compose(fillForm, pick(['name', 'permissions']))(accessToken);
    }, [accessToken, dispatch, formName]);

    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
                <FieldConnector fieldProps={{ fullWidth: true }} deepPath={`${formName}.name`} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <FieldConnector
                    fieldProps={{ fullWidth: true }}
                    deepPath={`${formName}.permissions`}
                    component={({ onChange, value }: { onChange: (e: any) => void; value?: Permission[] }) => {
                        function handleChange(value: string[]) {
                            onChange({ target: { value } });
                        }

                        return (
                            <>
                                <List
                                    // subheader={<ListSubheader>{label}</ListSubheader>}
                                    sx={[{ bgcolor: 'background.paper', overflow: 'auto' }]}
                                >
                                    <ListItemButton
                                        selected={value?.length === 1 && value?.includes(Permission.read)}
                                        onClick={() => handleChange(['read'])}
                                    >
                                        čtení
                                    </ListItemButton>
                                    <ListItemButton
                                        selected={value?.length === 1 && value?.includes(Permission.write)}
                                        onClick={() => handleChange(['read', 'control'])}
                                    >
                                        ovládání
                                    </ListItemButton>
                                    <ListItemButton
                                        selected={
                                            value?.includes(Permission.read) &&
                                            value?.includes(Permission.write) &&
                                            value?.includes(Permission.control)
                                        }
                                        onClick={() => handleChange(['read', 'write', 'control'])}
                                    >
                                        správa
                                    </ListItemButton>
                                </List>
                            </>
                        );
                    }}
                    fullWidth
                    options={TokenPermissions}

                // selectOptions={TokenPermissions.map(({ value, label }) => (
                //     <MenuItem value={value} key={label}>
                //         {label}
                //     </MenuItem>
                // ))}
                />
            </Grid>
        </Grid>
    );
}

export default EditDeviceForm;
