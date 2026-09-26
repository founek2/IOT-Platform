import { PropertyClass } from 'common/models/interface/thing';
import ThermometrIcon from './sensorIcons/thermometr.svg?react';
import HumidityIcon from './sensorIcons/humidity.svg?react';
import VoltageIcon from './sensorIcons/voltage.svg?react';
import BarometrIcon from './sensorIcons/barometer.svg?react';

export const SensorIcons = {
    [PropertyClass.humidity]: HumidityIcon,
    [PropertyClass.temperature]: ThermometrIcon,
    [PropertyClass.voltage]: VoltageIcon,
    [PropertyClass.pressure]: BarometrIcon,
};
