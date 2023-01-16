import React, { useMemo } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import createTheme from '@mui/material/styles/createTheme';
import { orange } from '@mui/material/colors';
import { useAppSelector } from '../hooks';
import { getColorMode } from '../selectors/getters';

declare module '@mui/material/styles' {
    interface Theme {
        status: {
            danger: string;
        };
    }
    // allow configuration using `createTheme`
    interface ThemeOptions {
        status?: {
            danger?: string;
        };
    }
}

export function MyThemeProvider({ children }: { children: React.ReactNode }) {
    const colorMode = useAppSelector(getColorMode);
    const theme = useMemo(
        () =>
            createTheme({
                status: {
                    danger: orange[500],
                },
                palette: {
                    mode: colorMode,
                },
            }),
        [colorMode]
    );

    return (
        <>
            <CssBaseline />
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </>
    );
}