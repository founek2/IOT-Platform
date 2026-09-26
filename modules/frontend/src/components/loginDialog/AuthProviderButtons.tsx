import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import React from 'react';
import { AuthProvider } from '../../endpoints/signIn.js';

function AuthProviderButtons({ providers }: { providers: AuthProvider[] }) {
    return (
        <Paper
            elevation={1}
            sx={{
                width: 110,
                height: 70,
                backgroundColor: 'primary.main',
                display: 'flex',
                flexItems: 'center',
                justifyContent: 'center',
            }}
        >
            {providers.map(({ provider, authUrl, iconUrl }) => (
                <IconButton key={provider} onClick={() => window.open(authUrl, '_self')}>
                    <img src={iconUrl} alt={provider} />
                </IconButton>
            ))}
        </Paper>
    );
}

export default AuthProviderButtons;
