import { MenuItem, useTheme } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectProps } from '@mui/material/Select';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useState } from 'react';

export interface SelectOption {
    label: string;
    value: any;
}

function SelectField({
    label,
    value,
    onChange,
    onBlur,
    onFocus,
    fullWidth,
    error,
    helperText,
    options,
    FormHelperTextProps,
    ...props
}: SelectProps & { helperText?: string, options: SelectOption[], FormHelperTextProps: any }) {
    const theme = useTheme();
    const isWide = useMediaQuery(theme.breakpoints.up('md'));

    const [showPsswd, setShowPsswd] = useState(false);
    return (
        <FormControl variant="standard" fullWidth={fullWidth}>
            <InputLabel htmlFor="standard-adornment-select" error={error}>
                {label || ''}
            </InputLabel>
            <Select
                label={label}
                type={showPsswd ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={onFocus}
                fullWidth={fullWidth}
                error={error}
                {...props}
            >
                {options.map(({ value, label }) => (
                    <MenuItem value={value} key={value}>
                        {label}
                    </MenuItem>
                ))}
            </Select>
            {error ? (
                <FormHelperText sx={{ margin: 0 }} error={error}>
                    {helperText}
                </FormHelperText>
            ) : null}
        </FormControl>
    );
}

export default SelectField;
