import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import EditUserForm from '../components/EditUserForm';
import { RegisterUserForm, useRegisterAndSignInMutation, useRegisterMutation } from '../endpoints/users';
import { useForm } from '../hooks/useForm';
import { notificationActions } from '../store/slices/notificationSlice';
import SuccessMessages from 'common/src/localization/succcess';

export default function Registration() {
    const [registerAndSignIn, setRegisterAndSignIn] = useState(true);
    const { validateForm, resetForm } = useForm<RegisterUserForm>('REGISTRATION', { resetOnUnmount: true });
    const [registerAndSignInMutation] = useRegisterAndSignInMutation();
    const [registerMutation] = useRegisterMutation();
    const dispatch = useDispatch();

    async function handleRegister() {
        const result = validateForm();
        if (!result.valid) return;

        (registerAndSignIn ? registerAndSignInMutation(result.data) : registerMutation(result.data))
            .unwrap()
            .then(() => {
                dispatch(notificationActions.add({ message: SuccessMessages.getMessage("userCreated"), options: { variant: 'success' } }))
                resetForm()
            })
            .catch(() => { });
    }

    return (
        <Grid container justifyContent="center">
            <Grid size={{ xs: 12, md: 7, lg: 6, xl: 4 }}>
                <Card sx={{ padding: 2 }}>
                    <CardContent>
                        <EditUserForm formName="REGISTRATION" />
                    </CardContent>
                    <CardActions sx={(theme) => ({ [theme.breakpoints.up('md')]: { justifyContent: 'center' } })}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={registerAndSignIn}
                                    onChange={(e, value) => setRegisterAndSignIn(value)}
                                />
                            }
                            label="Po registraci přihlásit"
                        />
                        <Button onClick={handleRegister}>Registrovat</Button>
                    </CardActions>
                </Card>
            </Grid>
        </Grid>
    );
}
