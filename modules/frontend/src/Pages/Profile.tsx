import React from 'react';
import { Box, Breadcrumbs, Grid, Typography } from '@mui/material';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Account from './profile/Account';
import AccessTokens from './profile/AcessTokens';
import Security from './profile/Security';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import SecurityIcon from '@mui/icons-material/Security';

const menu = [
    { icon: AccountCircleIcon, text: 'Účet', link: '/profile' },
    { icon: AccessibilityIcon, text: 'Přístupnost', link: '/profile/accessTokens' },
    { icon: SecurityIcon, text: 'Zabezpečení', link: '/profile/security' },
    // { icon: PersonAddIcon, text: "Vytvořit uživatele", link: "/profile/addUser", role: "ENTITY_MANAGER" }
];

function Profile() {
    const location = useLocation()

    return (
        <Grid container pt={2} alignItems="center" flexDirection="column" pl={1} pr={1} maxWidth={800} width="100%" margin="0 auto" >
            <Grid>
                <Breadcrumbs aria-label="breadcrumb">
                    {menu.map(({ icon: Icon, text, link }) => (
                        <Link to={link} key={link} className="util--flex">
                            <Box display="flex" >
                                <Icon />
                                <Typography
                                    color={location.pathname === link ? 'textPrimary' : 'inherit'}
                                >
                                    {text}
                                </Typography>
                            </Box>
                        </Link>

                    ))}
                </Breadcrumbs>
            </Grid>
            <Grid pt={3} width="100%" display="flex" justifyContent="center">
                <Routes>
                    <Route element={<Security />} path="security" />
                    <Route element={<AccessTokens />} path="accessTokens" />
                    <Route element={<Account />} path="/" />
                </Routes>
            </Grid>

        </Grid>
    );
}

export default Profile;
