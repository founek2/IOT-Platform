import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { logger } from 'common/logger';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSignInOauthMutation } from '../endpoints/signIn.js';
import { buildRedirectUri } from '../utils/redirectUri.js';

export function Authorization() {
    const [searchParams] = useSearchParams();
    const { code, error }: Partial<{ code: string; error: string }> = Object.fromEntries(searchParams.entries());
    const navigate = useNavigate();
    const [message, setMessage] = useState('Probíhá přihlašování...');
    const [signIn, { isLoading }] = useSignInOauthMutation();

    useEffect(() => {
        if (!code) return;

        signIn({ code, redirectUri: buildRedirectUri() })
            .unwrap()
            .then(() => {
                navigate('/building');
            })
            .catch((err: any) => {
                logger.error('failed signIn by oauth code', err);
                setMessage('Při přihlašování nastala chyba, akci opakujte');
                navigate({ search: '' }); // clear code
            });
    }, [code, history]);

    useEffect(() => {
        if (error) {
            setMessage('Při přihlašování nastala chyba, akci opakujte');
        }
    }, [error, setMessage]);

    return (
        <div className="utils--center">
            <Typography component="span" pt={2}>
                {message}
            </Typography>
            {isLoading ? <CircularProgress /> : null}
        </div>
    );
}
