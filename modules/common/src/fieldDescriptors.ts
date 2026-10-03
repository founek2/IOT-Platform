import validationFactory from './validations/validationFactory.js';
import { assocPath, isNil } from 'ramda';
import { AuthType, NotifyIntervals } from './constants/index.js';
import { DeviceCommand } from './models/interface/device.js';
import { NotifyType } from './models/interface/notifyInterface.js';
import { transformToForm } from './validations/transformToForm.js';
import { FieldDescriptor, FieldDescriptors, FormFieldDescriptors } from './validations/types.js';
import { ComponentType } from './models/interface/thing.js';

const LOGIN: FormFieldDescriptors = {
    userName: {
        deepPath: 'LOGIN.userName',
        required: true,
        label: 'Uživatelské jméno',
        name: 'username',
        validations: [validationFactory('isString', { min: 4, max: 30 })],
    },
    password: {
        deepPath: 'LOGIN.password',
        required: true,
        when: ({ authType }: any) => authType === AuthType.passwd,
        label: 'Heslo',
        name: 'password',
        validations: [validationFactory('isString', { min: 4, max: 20 })],
    },
    authType: {
        deepPath: 'LOGIN.authType',
        required: true,
        label: 'Pokročilá autentizace',
        name: 'authtype',
        validations: [validationFactory('isString', { min: 4, max: 20 })],
    },
};

const REFRESH_TOKEN: FormFieldDescriptors = {
    token: {
        deepPath: 'REFRESH_TOKEN.token',
        required: true,
        label: 'Refresh token',
        validations: [validationFactory('isString', { min: 4 })],
    },
}
const userFields: FormFieldDescriptors = {
    info: {
        userName: {
            deepPath: 'REGISTRATION.info.userName',
            required: true,
            label: 'Uživatelské jméno',
            name: 'username',
            validations: [validationFactory('isString', { min: 4, max: 30 })],
        },
        firstName: {
            deepPath: 'REGISTRATION.info.firstName',
            required: false,
            label: 'Jméno',
            name: 'firstname',
            validations: [validationFactory('isString', { min: 2, max: 20 })],
        },
        lastName: {
            deepPath: 'REGISTRATION.info.lastName',
            required: false,
            label: 'Příjmení',
            name: 'lastname',
            validations: [validationFactory('isString', { min: 2, max: 20 })],
        },
        email: {
            deepPath: 'REGISTRATION.info.email',
            label: 'Email',
            name: 'email',
            required: true,
            validations: [validationFactory('isEmail')],
        },
    },
};

const passwd: FieldDescriptor = {
    deepPath: 'REGISTRATION.auth.password',
    required: true,
    label: 'Heslo',
    name: 'password',
    validations: [validationFactory('isString', { min: 4, max: 20 })],
};

const REGISTRATION = assocPath(['auth', 'password'], passwd, userFields);

const passwdNotReq: FieldDescriptor = {
    deepPath: 'EDIT_USER.auth.password',
    required: false,
    label: 'Heslo',
    name: 'password',
    validations: [validationFactory('isString', { min: 4, max: 20 })],
};

const EDIT_USER: FormFieldDescriptors = assocPath(['auth', 'password'], passwdNotReq, {
    ...transformToForm('EDIT_USER', userFields),
    groups: {
        deepPath: 'EDIT_USER.groups',
        label: 'Uživatelské skupiny',
        required: true,
        name: 'groups',
        validations: [validationFactory('isNotEmptyArray')],
    },
});

const CREATE_DEVICE = {
    info: {
        name: {
            deepPath: 'CREATE_DEVICE.info.name',
            required: true,
            label: 'Název',
            name: 'title',
            validations: [validationFactory('isString', { min: 2, max: 20 })],
        },
        location: {
            building: {
                deepPath: 'CREATE_DEVICE.info.location.building',
                required: true,
                label: 'Budova',
                validations: [validationFactory('isString', { min: 2, max: 50 })],
            },
            room: {
                deepPath: 'CREATE_DEVICE.info.location.room',
                required: true,
                label: 'Místnost',
                validations: [validationFactory('isString', { min: 2, max: 50 })],
            },
        },
    },
};

const EDIT_PERMISSIONS: FormFieldDescriptors = {
    read: {
        deepPath: 'EDIT_PERMISSIONS.read',
        label: 'Čtení',
        required: true,
    },
    write: {
        deepPath: 'EDIT_PERMISSIONS.write',
        required: true,
        label: 'Editace',
    },
    control: {
        deepPath: 'EDIT_PERMISSIONS.control',
        label: 'Ovládání',
        required: true,
    },
};

const EDIT_DEVICE: FormFieldDescriptors = {
    info: {
        name: {
            deepPath: 'EDIT_DEVICE.info.name',
            required: true,
            label: 'Název',
            name: 'title',
            validations: [validationFactory('isString', { min: 2, max: 20 })],
        },
        location: {
            building: {
                deepPath: 'EDIT_DEVICE.info.location.building',
                required: true,
                label: 'Budova',
                validations: [validationFactory('isString', { min: 2, max: 50 })],
            },
            room: {
                deepPath: 'EDIT_DEVICE.info.location.room',
                required: true,
                label: 'Místnost',
                validations: [validationFactory('isString', { min: 2, max: 50 })],
            },
        },
    },
    permissions: {
        deepPath: 'EDIT_DEVICE.permissions',
        label: 'Oprávnění',
    },
};

const EDIT_NOTIFY: FormFieldDescriptors = {
    'propertyId[]': {
        deepPath: 'EDIT_NOTIFY.propertyId[]',
        getLength: ({ count }) => count,
        label: 'Vlastnost',
        required: true,
        validations: [validationFactory('isString')],
    },
    'type[]': {
        deepPath: 'EDIT_NOTIFY.type[]',
        getLength: ({ count }) => count,
        label: 'Podmínka',
        required: true,
        validations: [validationFactory('isOneOf', { values: Object.values(NotifyType) })],
    },
    'value[]': {
        deepPath: 'EDIT_NOTIFY.value[]',
        getLength: ({ count }) => count,
        label: 'Mezní hodnota',
        required: true,
        when: ({ type }, { i }) => isNil(type) || isNil(i) || type[i] !== NotifyType.always,
        // validations: [validationFactory("isNumber")],
    },
    'textTemplate[]': {
        deepPath: 'EDIT_NOTIFY.textTemplate[]',
        getLength: ({ count }) => count,
        label: 'Šablona pro text notifikace',
        required: true,
        validations: [validationFactory("isString")],
    },
    advanced: {
        'daysOfWeek[]': {
            deepPath: 'EDIT_NOTIFY.advanced.daysOfWeek[]',
            getLength: ({ count }) => count,
            label: 'Dny v týdnu',
            required: true,
            validations: [validationFactory('isArray', { min: 1, max: 7 })],
        },
        'interval[]': {
            deepPath: 'EDIT_NOTIFY.advanced.interval[]',
            getLength: ({ count }) => count,
            label: 'Interval',
            required: true,
            validations: [validationFactory('isOneOf', { values: NotifyIntervals.map((obj) => obj.value) })],
        },
        'from[]': {
            deepPath: 'EDIT_NOTIFY.advanced.from[]',
            getLength: ({ count }) => count,
            label: 'Od',
            required: true,
            validations: [validationFactory('isTime')],
        },
        'to[]': {
            deepPath: 'EDIT_NOTIFY.advanced.to[]',
            getLength: ({ count }) => count,
            label: 'Do',
            required: true,
            validations: [validationFactory('isTime')],
        },
    },
    count: {
        deepPath: 'EDIT_NOTIFY.count',
        required: true,
        validations: [validationFactory('isNumber', { max: 20 })],
    },
};


const EDIT_THING: FormFieldDescriptors = {
    "config": {
        "name": {
            deepPath: 'EDIT_THING.config.name',
            required: true,
            label: 'Název',
            name: 'name',
        },
        "nodeId": {
            deepPath: 'EDIT_THING.config.nodeId',
            required: true,
            label: 'Id uzlu',
            name: 'nodeId',
        },
        "componentType": {
            deepPath: 'EDIT_THING.config.componentType',
            required: true,
            label: 'Typ',
            name: 'componentType',
            validations: [validationFactory('isOneOf', { values: Object.values(ComponentType) })]
        },
        "properties": {
            deepPath: 'EDIT_THING.config.properties',
            required: true,
            label: 'Vlastnosti',
            name: 'properties',
            // TODO provider descriptor for isArray validation
            validations: [validationFactory('isArray')]
        },
    },
};

const USER_MANAGEMENT: FormFieldDescriptors = {
    selected: {
        deepPath: 'USER_MANAGEMENT.selected',
        required: true,
        validations: [validationFactory('isNotEmptyArray')],
    },
};

const DISCOVERY_DEVICES: FormFieldDescriptors = {
    selected: {
        deepPath: 'DISCOVERY_DEVICES.selected',
        required: true,
        validations: [validationFactory('isNotEmptyArray')],
    },
};

const ADD_PUSH_SUBSCRIPTION: FormFieldDescriptors = {
    endpoint: {
        deepPath: 'ADD_PUSH_SUBSCRIPTION.endpoint',
        label: 'Endpoint',
        required: true,
        validations: [
            validationFactory('isString', {
                startsWith: "https://"
            }),
        ],
    },
    expirationTime: {
        deepPath: 'ADD_PUSH_SUBSCRIPTION.expirationTime',
        label: 'expirationTime',
    },
    keys: {
        auth: {
            deepPath: 'ADD_PUSH_SUBSCRIPTION.keys.auth',
            label: 'Auth',
            required: true,
            validations: [
                validationFactory('isString'),
            ],
        },
        p256dh: {
            deepPath: 'ADD_PUSH_SUBSCRIPTION.keys.p256dh',
            label: 'p256dh',
            required: true,
            validations: [
                validationFactory('isString', {
                    min: 5,
                }),
            ],
        },
    },
};


const MODIFY_PUSH_SUBSCRIPTION: FormFieldDescriptors = {
    old: {
        endpoint: {
            deepPath: 'ADD_PUSH_SUBSCRIPTION.endpoint',
            label: 'Endpoint',
            required: true,
            validations: [
                validationFactory('isString', {
                    startsWith: "https://"
                }),
            ],
        },
    },
    new: transformToForm("MODIFY_PUSH_SUBSCRIPTION.new", ADD_PUSH_SUBSCRIPTION),
};

const DEVICE_SEND: FormFieldDescriptors = {
    command: {
        deepPath: 'DEVICE_SEND.command',
        label: 'Příkaz',
        required: true,
        validations: [validationFactory('isOneOf', { values: Object.values(DeviceCommand) })],
    },
};

const FORGOT: FormFieldDescriptors = {
    email: {
        deepPath: 'FORGOT.email',
        label: 'Email',
        name: 'email',
        required: true,
        validations: [validationFactory('isEmail')],
    },
};

const FORGOT_PASSWORD: FormFieldDescriptors = {
    password: {
        deepPath: 'FORGOT_PASSWORD.password',
        required: true,
        label: 'Heslo',
        name: 'password',
        validations: [validationFactory('isString', { min: 4, max: 40 })],
    },
    token: {
        deepPath: 'FORGOT_PASSWORD.token',
        required: true,
        label: 'Token',
        validations: [validationFactory('isString', { min: 60, max: 65 })],
    },
};

const ADD_ACCESS_TOKEN: FormFieldDescriptors = {
    name: {
        deepPath: 'ADD_ACCESS_TOKEN.name',
        required: true,
        label: 'Název',
        name: 'name',
        validations: [validationFactory('isString', { min: 1, max: 40 })],
    },
    permissions: {
        deepPath: 'ADD_ACCESS_TOKEN.permissions',
        required: true,
        label: 'Oprávnění',
        name: 'permissions',
        validations: [validationFactory('isArray', { min: 1 })], // TODO oneOf
    },
};

const EDIT_ACCESS_TOKEN = transformToForm('EDIT_ACCESS_TOKEN', ADD_ACCESS_TOKEN);

const AUTHORIZATION: FormFieldDescriptors = {
    code: {
        deepPath: 'AUTHORIZATION.code',
        required: true,
        label: 'Kód',
        name: 'code',
        validations: [validationFactory('isString', { min: 5, max: 100 })],
    },
    redirectUri: {
        deepPath: 'AUTHORIZATION.redirectUri',
        required: true,
        label: 'Adresa pro přesměrování',
        name: 'redirectUri',
        validations: [validationFactory('isString', { min: 5, max: 200 })],
    },
};

const USER_DASHBOARD: FormFieldDescriptors = {
    preferences: {
        deepPath: 'USER_DASHBOARD.preferences',
        required: false,
        label: 'Preference',
        name: 'preferences',
        validations: [validationFactory('isArray', {
            descriptor: {
                propertyId: {
                    deepPath: 'USER_DASHBOARD.preferences.propertyId',
                    required: true,
                    label: 'ID vlastnosti',
                    name: 'propertyId',
                    validations: [validationFactory('isString', { min: 1, max: 40 })],
                },
                thingId: {
                    deepPath: 'USER_DASHBOARD.preferences.thingId',
                    required: true,
                    label: 'ID věci',
                    name: 'thingId',
                    validations: [validationFactory('isString', { min: 1, max: 40 })],
                },
                group: {
                    deepPath: 'USER_DASHBOARD.preferences.group',
                    required: false,
                    label: 'Skupina',
                    name: 'group',
                    validations: [validationFactory('isString', { min: 1, max: 40 })],
                }
            }
        })],
    },
};

const descriptors: FieldDescriptors = {
    LOGIN,
    REGISTRATION,
    USER_MANAGEMENT,
    EDIT_USER,
    CREATE_DEVICE,
    EDIT_DEVICE,
    EDIT_PERMISSIONS,
    EDIT_NOTIFY,
    ADD_PUSH_SUBSCRIPTION,
    DISCOVERY_DEVICES,
    DEVICE_SEND,
    FORGOT,
    FORGOT_PASSWORD,
    ADD_ACCESS_TOKEN,
    EDIT_ACCESS_TOKEN,
    AUTHORIZATION,
    EDIT_THING,
    REFRESH_TOKEN,
    MODIFY_PUSH_SUBSCRIPTION,
    USER_DASHBOARD,
};

export default descriptors;
