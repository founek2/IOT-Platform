import React, { useState } from 'react';
import Search from '@mui/icons-material/Search';

import {
    FormControl,
    FormHelperText,
    IconButton,
    Input,
    InputAdornment,
    InputLabel,
    TextFieldProps,
    useMediaQuery,
    useTheme,
} from '@mui/material';

export default function SearchField({
    label,
    value,
    onChange,
    onBlur,
    onFocus,
    fullWidth,
    error,
    helperText,
    onClick,
    sx,
    ...props
}: TextFieldProps & { onClick?: React.MouseEventHandler<HTMLButtonElement> }) {
    return (
        <FormControl variant="standard" fullWidth={fullWidth} sx={sx}>
            <InputLabel htmlFor="standard-adornment-password" error={error}>
                {label || ''}
            </InputLabel>
            <Input
                id="standard-adornment-password"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={onFocus}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton aria-label="toggle password visibility" onClick={onClick}>
                            <Search />
                        </IconButton>
                    </InputAdornment>
                }
                fullWidth={fullWidth}
                error={error}
            />
            {error ? <FormHelperText error={error}>{helperText}</FormHelperText> : null}
        </FormControl>
    );
}