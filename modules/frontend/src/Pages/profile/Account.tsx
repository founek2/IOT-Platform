import { Button, Grid } from '@mui/material';
import { useAppDispatch } from 'frontend/src/hooks';
import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import EditUserForm from '../../components/EditUserForm';
import { getCurrentUser } from '../../selectors/getters';

function Account() {
    const user = useSelector(getCurrentUser);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    if (!user) return <p>Načítám data...</p>;

    return (
        <Grid container justifyContent="center">
            <Grid>
                <Button variant='contained' onClick={() => navigate({ search: `?editUser=current` })}>Upravit informace</Button>
            </Grid>
        </Grid>
    );
}

export default Account;
