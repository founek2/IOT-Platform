import React, { useEffect, useState } from 'react';
import {
    amber,
    blue,
    blueGrey,
    brown,
    cyan,
    deepOrange,
    deepPurple,
    green,
    grey,
    indigo,
    lightBlue,
    lightGreen,
    lime,
    orange,
    pink,
    purple,
    red,
    teal,
    yellow,
} from '@mui/material/colors';
// import { HuePicker, TwitterPicker } from 'react-color';
import { RgbColorPicker } from 'react-colorful';
import Paper from '@mui/material/Paper';
import { Dialog } from './Dialog.js';

const COLORS = [
    '#FFFFFF',
    red[500],
    pink[500],
    purple[500],
    deepPurple[500],
    indigo[500],
    blue[500],
    lightBlue[500],
    cyan[500],
    teal[500],
    green[500],
    lightGreen[500],
    lime[500],
    yellow[500],
    amber[500],
    orange[500],
    deepOrange[500],
    brown[500],
    blueGrey[500],
    grey[500],
];

function componentToHex(c: number) {
    var hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex(rgb: string) {
    const [r, g, b] = rgb.split(',').map((val) => parseInt(val));
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

interface SwitchMyProps {
    onChange?: (event: { target: { value: string } }) => void;
    value?: string;
    disabled?: boolean;
}

let timeout: NodeJS.Timeout;

function ColorPicker({ value, disabled, onChange }: SwitchMyProps) {
    const [pickedColor, setPickedColor] = useState<{ r: number; g: number; b: number }>();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (value) {
            try {
                const [r, g, b] = value.split(',').map((v) => parseInt(v));
                setPickedColor({ r, g, b });
            } catch (err) {}
        }
    }, [setPickedColor, value]);

    return (
        <div>
            <Paper
                elevation={1}
                onClick={() => setOpen(true)}
                sx={{
                    width: 100,
                    backgroundColor: `rgb(${pickedColor?.r},${pickedColor?.g},${pickedColor?.b})`,
                    height: 30,
                    cursor: 'pointer',
                }}
            />
            <Dialog title="Barva" open={open} onClose={() => setOpen(false)}>
                <>
                    <RgbColorPicker
                        color={pickedColor}
                        onChange={(color) => {
                            setPickedColor(color);
                            const { r, g, b } = color;

                            if (timeout) clearTimeout(timeout);
                            if (onChange)
                                timeout = setTimeout(() => onChange({ target: { value: `${r},${g},${b}` } }), 300);
                        }}
                    />
                </>
            </Dialog>
        </div>
    );
}

export default ColorPicker;
