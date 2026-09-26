import { Box } from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import { styled, withStyles } from '@mui/material/styles';
import clsx from 'clsx';
import { append, equals, filter, ifElse, includes, not, o, __, curry } from 'ramda';
import React from 'react';
import { notEqual } from 'common/utils/notEqual';

export const daysInWeek = [
    { value: 1, label: 'Po' },
    { value: 2, label: 'Út' },
    { value: 3, label: 'St' },
    { value: 4, label: 'Čt' },
    { value: 5, label: 'Pá' },
    { value: 6, label: 'So' },
    { value: 0, label: 'Ne' },
];

const DayChip = styled(Box)({
    width: 40,
    height: 40,
    borderRadius: 30,
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.44)',
    color: 'rgba(255, 255, 255, 0.78)',
    cursor: 'pointer',
    userSelect: 'none',
})

// TODO interface
export interface DaysOfWeekPickerProps {
    id: string;
    onChange: React.EventHandler<any>;
    value: number[];
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
}
function DaysOfWeekPicker({ value = [], onChange, error, FormHelperTextProps, helperText, label, ...other }: DaysOfWeekPickerProps) {
    function handleChange(num: number) {
        const removeOrAdd = (el: number, array: number[]) =>
            // @ts-ignore
            ifElse(includes(__, array), o(filter(__, array), curry(notEqual)), append(__, array))(el);

        onChange({ target: { value: removeOrAdd(num, value) } });
    }

    return (
        <Box display="flex" flexDirection="column">
            <FormLabel sx={{ fontSize: 12, textAlign: "left" }}>{label}</FormLabel>
            <Box display="flex" justifyContent="space-between" marginTop={1}>
                {daysInWeek.map(({ value: val, label }) => (
                    <DayChip
                        key={val}
                        sx={value.includes(val) ? { backgroundColor: "green" } : undefined}
                        onClick={(e) => handleChange(val)}
                    >
                        {label}
                    </DayChip>
                ))}
            </Box>
            {error && <FormHelperText {...FormHelperTextProps}>{helperText}</FormHelperText>}
        </Box>
    );
}

export default DaysOfWeekPicker;
