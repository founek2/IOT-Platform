import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import { logger } from 'common/lib/logger';
import { AuthType } from 'common/src/constants';
import { getFieldVal } from 'common/src/utils/getters';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAuthProvidersQuery, useLazyGetAuthTypesQuery, useSignInMutation } from '../endpoints/signIn';
import { useAppSelector } from '../hooks';
import { useForm } from '../hooks/useForm';
import { head } from '../utils/ramda';
import FieldConnector from './FieldConnector';
import AuthProviderButtons from './loginDialog/AuthProviderButtons';

interface LoginForm {
    userName: string;
    password: string;
    authType: string;
}

let timer: NodeJS.Timeout;
function onStopTyping(callback: () => void) {
    clearTimeout(timer);
    timer = setTimeout(callback, 400);
}

interface LoginDialogProps {
    open: boolean;
    onClose: () => void;
}
export default function LoginDialog({ onClose, open }: LoginDialogProps) {
    const navigate = useNavigate();
    const { data: dataProviders } = useGetAuthProvidersQuery();
    const { validateField, validateForm, setFieldValue, resetForm } = useForm<LoginForm>('LOGIN');
    const [getAuthTypes, { isLoading: isLoadingAuthTypes, data: authTypesData, error, isError }] =
        useLazyGetAuthTypesQuery();
    const [signIn, { isLoading: isLoadingSignIn }] = useSignInMutation();
    const authTypeSelected = useAppSelector(getFieldVal('LOGIN.authType'));

    function handleNext() {
        const { value, valid } = validateField(['userName']);
        if (valid) getAuthTypes(value);
    }

    function handleSignIn() {
        const { valid, data } = validateForm();
        if (valid) {
            signIn(data)
                .unwrap()
                .then(() => {
                    console.log('done');
                    handleClose();
                    navigate('/building');
                })
                .then(resetForm)
                .catch((err) => logger.error(err));
        }
    }
    function handleClose() {
        onClose();
        resetForm();
    }

    const actionHandler = !authTypesData?.authTypes.length ? handleNext : handleSignIn;

    return (
        <Dialog
            disableRestoreFocus
            open={open}
            // keepMounted
            fullWidth
            onClose={handleClose}
            PaperProps={{
                sx: {
                    overflowY: 'visible',
                    maxWidth: 400,
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'center',
                    top: -20,
                    position: 'absolute',
                }}
            >
                {dataProviders?.oauth ? <AuthProviderButtons providers={dataProviders.oauth} /> : null}
            </Box>
            <DialogTitle align="center" mt={7}>
                {'Přihlášení'}
            </DialogTitle>
            <DialogContent
                sx={(theme) => ({
                    [theme.breakpoints.up('sm')]: {
                        pl: 7,
                        pr: 7,
                    },
                })}
            >
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        <FieldConnector
                            autoFocus
                            deepPath="LOGIN.userName"
                            fieldProps={{ autoComplete: 'username' }}
                            fullWidth
                            onChange={(e) =>
                                onStopTyping(async () => {
                                    const res = await getAuthTypes(e.target.value);
                                    const type = head(res.data?.authTypes || []);
                                    setFieldValue(type, ['authType']);
                                })
                            }
                            onEnter={actionHandler}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <FieldConnector
                            autoFocus
                            deepPath="LOGIN.password"
                            fieldProps={{ type: 'password', autoComplete: 'current-password' }}
                            fullWidth
                            onEnter={actionHandler}
                            sx={authTypeSelected === AuthType.passwd ? undefined : { display: 'none' }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center' }}>
                {isLoadingAuthTypes || isLoadingSignIn ? (
                    <CircularProgress />
                ) : !authTypesData?.authTypes.length ? (
                    <Button onClick={handleNext}>Další</Button>
                ) : (
                    <Button onClick={handleSignIn}>Přihlásit</Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
