import React from "react"
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import DataList from '../components/DataList';
import { User } from '../endpoints/signIn';
import { useUsersQuery } from '../endpoints/users';

function extractHumanText(user: User) {
    let text = user.info.userName;

    if (user.groups.some((group) => group === 'admin' || group === 'root')) text += '*';

    text += ' (' + user.info.email;

    if (user.info.firstName) text += ` ${user.info.firstName}`;

    if (user.info.lastName) text += ` ${user.info.lastName}`;

    return text + ')';
}

export default function UserManagement() {
    const { isLoading, data } = useUsersQuery(undefined);
    const navigate = useNavigate()

    if (isLoading) return <CircularProgress />

    return (
        <>
            <Grid container justifyContent="center">
                <Grid size={{ xs: 12, md: 7, lg: 6, xl: 3 }}>
                    <Card sx={{ padding: 4 }}>
                        <DataList data={data || []} getHumanText={extractHumanText} onClick={(user) => navigate({ search: `?editUser=${user._id}` })} />
                    </Card>
                </Grid>
            </Grid>
        </>
    );
}
