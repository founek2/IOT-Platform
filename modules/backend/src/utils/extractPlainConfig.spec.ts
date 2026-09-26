import { extractPlainConfig } from './extractPlainConfig.js';

const existingThings = [
    {
        _id: '632f5e8b392260257b44276d',
        config: {
            name: 'Světlo',
            componentType: 'switch',
            properties: [
                {
                    _id: '632f5e8b392260257b44276e',
                    name: 'Světlo',
                    dataType: 'boolean',
                    settable: true,
                    propertyId: 'power',
                },
            ],
            nodeId: 'light',
        },
    },
    {
        _id: '632f5e8b392260257b44276f',
        config: {
            name: 'Meteo',
            componentType: 'sensor',
            properties: [
                {
                    _id: '632f5e8b392260257b442770',
                    name: 'Teplota',
                    unitOfMeasurement: '°C',
                    dataType: 'float',
                    propertyClass: 'temperature',
                    propertyId: 'temp',
                    settable: false,
                },
                {
                    _id: '632f5e8b392260257b442771',
                    name: 'Vlhkost',
                    unitOfMeasurement: '%',
                    dataType: 'float',
                    propertyClass: 'humidity',
                    propertyId: 'hum',
                    settable: false,
                },
                {
                    _id: '632f5e8b392260257b442772',
                    name: 'Napětí',
                    unitOfMeasurement: 'V',
                    dataType: 'float',
                    propertyClass: 'voltage',
                    propertyId: 'volt',
                    settable: false,
                },
                {
                    _id: '632f5e8b392260257b442773',
                    name: 'Tlak',
                    unitOfMeasurement: 'hPa',
                    dataType: 'float',
                    propertyClass: 'pressure',
                    propertyId: 'press',
                    settable: false,
                },
                {
                    _id: '632f5e8b392260257b442774',
                    name: 'Teplota2',
                    unitOfMeasurement: '*C',
                    dataType: 'float',
                    propertyClass: 'temperature',
                    propertyId: 'temp2',
                    settable: false,
                },
            ],
            nodeId: 'meteo',
        },
        state: {
            timestamp: '2022-09-24T19:47:51.127Z',
            value: { volt: '10.5', temp: '21.6', hum: '90', temp2: '15.4', press: '100' },
        },
    },
    {
        _id: '632f5e8b392260257b442775',
        config: {
            name: 'Brána',
            componentType: 'activator',
            properties: [
                {
                    _id: '632f5e8b392260257b442776',
                    name: 'Brána',
                    dataType: 'enum',
                    format: ['on'],
                    settable: true,
                    propertyId: 'power',
                },
            ],
            nodeId: 'gate',
        },
    },
];

const plainThingsConfig = [
    {
        name: 'Světlo',
        componentType: 'switch',
        properties: [{ name: 'Světlo', dataType: 'boolean', settable: true, propertyId: 'power' }],
        nodeId: 'light',
    },
    {
        name: 'Meteo',
        componentType: 'sensor',
        properties: [
            {
                name: 'Teplota',
                unitOfMeasurement: '°C',
                dataType: 'float',
                propertyClass: 'temperature',
                propertyId: 'temp',
                settable: false,
            },
            {
                name: 'Vlhkost',
                unitOfMeasurement: '%',
                dataType: 'float',
                propertyClass: 'humidity',
                propertyId: 'hum',
                settable: false,
            },
            {
                name: 'Napětí',
                unitOfMeasurement: 'V',
                dataType: 'float',
                propertyClass: 'voltage',
                propertyId: 'volt',
                settable: false,
            },
            {
                name: 'Tlak',
                unitOfMeasurement: 'hPa',
                dataType: 'float',
                propertyClass: 'pressure',
                propertyId: 'press',
                settable: false,
            },
            {
                name: 'Teplota2',
                unitOfMeasurement: '*C',
                dataType: 'float',
                propertyClass: 'temperature',
                propertyId: 'temp2',
                settable: false,
            },
        ],
        nodeId: 'meteo',
    },
    {
        name: 'Brána',
        componentType: 'activator',
        properties: [{ name: 'Brána', dataType: 'enum', format: ['on'], settable: true, propertyId: 'power' }],
        nodeId: 'gate',
    },
];

describe('extract plain config', function () {
    it('should ignore _ids', function () {
        //@ts-ignore
        const extractedConfigs = existingThings.map(extractPlainConfig);

        expect(extractedConfigs).toEqual(plainThingsConfig);
    });
});
