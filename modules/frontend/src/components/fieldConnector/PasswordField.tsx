import React, { useState } from 'react';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import { TextFieldProps } from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material';

function PasswordField({
    label,
    value,
    onChange,
    onBlur,
    onFocus,
    fullWidth,
    error,
    helperText,
    ...props
}: TextFieldProps) {
    const theme = useTheme();
    const isWide = useMediaQuery(theme.breakpoints.up('md'));

    const [showPsswd, setShowPsswd] = useState(false);
    return (
        <FormControl variant="standard" fullWidth={fullWidth}>
            <InputLabel htmlFor="standard-adornment-password" error={error}>
                {label || ''}
            </InputLabel>
            <Input
                type={showPsswd ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={onFocus}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="toggle password visibility"
                            onMouseUp={isWide ? () => setShowPsswd(false) : undefined}
                            onMouseDown={isWide ? () => setShowPsswd(true) : undefined}
                            onClick={isWide ? undefined : () => setShowPsswd(!showPsswd)}
                        >
                            {showPsswd ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                }
                fullWidth={fullWidth}
                error={error}
            />
            {error ? (
                <FormHelperText sx={{ margin: 0 }} error={error}>
                    {helperText}
                </FormHelperText>
            ) : null}
        </FormControl>
    );
}

export default PasswordField;
