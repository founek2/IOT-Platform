import { Button, CircularProgress, Grid, Paper, Skeleton, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import React from 'react';
import { useGetActiveSignInQuery, useRemoveActiveSignInMutation } from '../../endpoints/signIn';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAccessToken } from '../../hooks/useAccessToken';
import { SecurityLoader } from './Security.loader';

function Security() {
    const { data, isLoading } = useGetActiveSignInQuery()
    const [removeSignInMutation, { isLoading: pendingRemove }] = useRemoveActiveSignInMutation()
    const { payload: currentAccessToken } = useAccessToken()

    if (isLoading) return <SecurityLoader />

    return (
        <Grid container spacing={1} maxWidth={600}>
            {data?.map((t) => {
                const createdAt = new Date(t.createdAt)
                const title = t.userAgent ? `${t.userAgent.device.vendor} ${t.userAgent.device.model}, ${t.userAgent.os.name} ${t.userAgent.os.version}, ${t.userAgent.browser.name} ${t.userAgent.browser.version}` : "Neznámé zařízení";
                return <Grid size={{ xs: 12 }} key={t._id}>
                    <Paper sx={{ p: 2 }}>
                        <Grid container justifyContent="space-between">
                            <Grid size={{ md: 9 }}>
                                <Typography fontWeight={500}>{title}</Typography>
                                <Typography variant='body2' color={grey[500]}>{createdAt.toLocaleDateString()}, {createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }} display="flex" alignItems="center" justifyContent="end">
                                {currentAccessToken?.iss === t._id ? <Typography>Tato relace</Typography> : <Button startIcon={<DeleteIcon />} onClick={() => removeSignInMutation(t._id)} disabled={pendingRemove}>
                                    Odebrat
                                </Button>}
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            })}
        </Grid>
    );
}

export default Security;
