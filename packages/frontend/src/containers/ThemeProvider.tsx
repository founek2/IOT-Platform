import React, { useEffect, useMemo } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { orange } from '@mui/material/colors';
import { useAppSelector } from '../hooks/index.js';
import { getColorMode } from '../selectors/getters.js';
import { createTheme } from '@mui/material';

export const LIGHT_BACKGROUND = "#fafafa"
export const DARK_BACKGROUND = "#4c4c4c"

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

    useEffect(() => {
        const body = window.document.querySelector("body")
        if (!body) return

        switch (colorMode) {
            case "light":
                body.style.backgroundColor = LIGHT_BACKGROUND
                break;
            case "dark":
                body.style.backgroundColor = DARK_BACKGROUND
                break;
        }
    })

    return (
        <>
            <CssBaseline />
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </>
    );
}
