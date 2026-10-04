import * as React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import AutocompleteMui, { createFilterOptions } from '@mui/material/Autocomplete';

const filter = createFilterOptions<{ value: string; label: string }>();

export interface AutocompleteOption {
    label: string;
    value: any;
}
export interface AutocompleteProps {
    options: { label: string; value: any }[];
    id: string;
    onChange: React.EventHandler<any>;
    value: any;
    className?: string;
    error: boolean;
    helperText: string;
    FormHelperTextProps: { error: boolean };
    onFocus: React.EventHandler<any>;
    onBlur: React.EventHandler<any>;
    name?: string;
    autoFocus?: boolean;
    onKeyDown: React.EventHandler<any>;
    label: string;
    variant?: 'filled' | 'outlined' | 'standard';
}
export default function Autocomplete({
    options,
    label,
    onChange,
    error,
    helperText,
    FormHelperTextProps,
    variant,
    ...props
}: AutocompleteProps) {
    return (
        <AutocompleteMui
            options={options}
            // disableClearable
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    error={error}
                    helperText={helperText}
                    FormHelperTextProps={FormHelperTextProps}
                    variant={variant}
                />
            )}
            filterOptions={(options, params) => {
                const filtered = filter(options, params);

                const { inputValue } = params;
                // Suggest the creation of a new value
                const isExisting = options.some((option) => inputValue === option.title);
                if (inputValue !== '' && !isExisting) {
                    filtered.push({
                        inputValue: inputValue,
                        label: `Add "${inputValue}"`,
                    } as any);
                }

                return filtered;
            }}
            getOptionLabel={(option) => {
                // Value selected with enter, right from the input
                if (typeof option === 'string') {
                    return option;
                }

                if (option?.inputValue) {
                    return option.inputValue;
                }
                // Regular option
                return option.label;
            }}
            renderOption={({ key, ...props }, option) => (
                <li key={key} {...props}>
                    {option.label}
                </li>
            )}
            freeSolo
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            onChange={(e, newValue) => {
                // Value selected with enter, right from the input
                if (typeof newValue === 'string') {
                    onChange({ target: { value: newValue } });
                } else if (newValue?.inputValue) {
                    onChange({ target: { value: newValue.inputValue } });
                } else onChange({ target: { value: newValue?.value || '' } });
            }}
            // isOptionEqualToValue={(option, value) => option.value === value}
            {...props}
        />
    );
}
