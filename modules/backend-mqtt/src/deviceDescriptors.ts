import validationFactory from 'common/validations/validationFactory';
import { ComponentType, PropertyClass, PropertyDataType } from 'common/models/interface/thing';
import { FormFieldDescriptors } from 'common/validations/types';
import { transformToForm } from 'common/validations/transformToForm';

const PROPERTY_BASE: FormFieldDescriptors = {
    propertyId: {
        deepPath: 'PROPERTY_BASE.propertyId',
        required: true,
        validations: [validationFactory('isString', { min: 1 })],
    },
    name: {
        deepPath: 'PROPERTY_BASE.name',
        required: true,
        validations: [validationFactory('isString', { min: 1 })],
    },
    propertyClass: {
        deepPath: 'PROPERTY_BASE.propertyClass',
        validations: [validationFactory('isOneOf', { values: Object.values(PropertyClass) })],
    },
    unitOfMeasurement: {
        deepPath: 'PROPERTY_BASE.unitOfMeasurement',
        validations: [validationFactory('isString', { min: 1 })],
    },
    dataType: {
        deepPath: 'PROPERTY_BASE.dataType',
        validations: [validationFactory('isOneOf', { values: Object.values(PropertyDataType) })],
    },
    settable: {
        deepPath: 'PROPERTY_BASE.settable',
        validations: [validationFactory('isOneOf', { values: ['true', 'false'] })],
    },
};

const THING = {
    config: {
        name: {
            deepPath: 'THING.config.name',
            required: true,
            validations: [validationFactory('isString', { min: 1 })],
        },
        nodeId: {
            deepPath: 'THING.config.nodeId',
            required: true,
            validations: [validationFactory('isString', { min: 1 })],
        },
        componentType: {
            deepPath: 'THING.config.componentType',
            required: true,
            validations: [validationFactory('isOneOf', { values: Object.values(ComponentType) })],
        },
        'properties[]': {
            deepPath: 'THING.config.componentType',
            required: true,
            validations: [validationFactory('isArray', { descriptor: PROPERTY_BASE })],
        },
    },
};

const DEVICE = {
    info: {
        name: {
            deepPath: 'DEVICE.info.name',
            required: true,
            validations: [validationFactory('isString', { min: 1 })],
        },
        description: {
            deepPath: 'DEVICE.info.description',
            validations: [validationFactory('isString')],
        },
        location: {
            building: {
                deepPath: 'DEVICE.info.location.building',
                required: true,
                validations: [validationFactory('isString', { min: 1 })],
            },
            room: {
                deepPath: 'DEVICE.info.location.room',
                required: true,
                validations: [validationFactory('isString', { min: 1 })],
            },
        },
    },
    'things[]': {
        deepPath: 'DEVICE.things',
        required: true,
        validations: [validationFactory('isArray', { descriptor: THING })],
    },
    metadata: {
        realm: {
            deepPath: 'DEVICE.metadata.realm',
            required: true,
            validations: [validationFactory('isString', { min: 1 })],
        },
        deviceId: {
            deepPath: 'DEVICE.metadata.deviceId',
            required: true,
            validations: [validationFactory('isString', { min: 1 })],
        },
    },
};

const PROPERTY_NUMERIC = {
    ...transformToForm('PROPERTY_NUMERIC', PROPERTY_BASE),
    dataType: {
        deepPath: 'PROPERTY_NUMERIC.dataType',
        required: true,
        validations: [validationFactory('isOneOf', { values: [PropertyDataType.integer, PropertyDataType.float] })],
    },
    format: {
        deepPath: 'PROPERTY_NUMERIC.format',
        validations: [validationFactory('isString', { pattern: /^-?[0-9]*:-?[0-9]*$/ })],
    },
};

const PROPERTY_ENUM = {
    ...transformToForm('PROPERTY_ENUM', PROPERTY_BASE),
    dataType: {
        deepPath: 'PROPERTY_ENUM.dataType',
        required: true,
        validations: [validationFactory('isOneOf', { values: [PropertyDataType.enum] })],
    },
    format: {
        deepPath: 'PROPERTY_ENUM.format',
        validations: [validationFactory('isString', { min: 1 })],
    },
};

export default {
    DEVICE,
    THING,
    PROPERTY_NUMERIC,
    PROPERTY_BASE,
    PROPERTY_ENUM,
};
