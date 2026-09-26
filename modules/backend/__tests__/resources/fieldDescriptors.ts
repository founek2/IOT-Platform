import { FormFieldDescriptors } from 'common/validations';
import validationFactory from 'common/validations/validationFactory';

const REGISTRATION: FormFieldDescriptors = {
    info: {
        userName: {
            deepPath: 'REGISTRATION.info.userName',
            required: true,
            label: 'Uživatelské jméno',
            validations: [validationFactory('isString', { min: 4, max: 30 })],
        },
        firstName: {
            deepPath: 'REGISTRATION.info.firstName',
            required: true,
            label: 'Jméno',
            validations: [validationFactory('isString', { min: 2, max: 20 })],
        },
        lastName: {
            deepPath: 'REGISTRATION.info.lastName',
            required: true,
            label: 'Příjmení',
            validations: [validationFactory('isString', { min: 2, max: 20 })],
        },
        email: {
            deepPath: 'REGISTRATION.info.email',
            label: 'Email',
            validations: [validationFactory('isEmail')],
        },
        phoneNumber: {
            deepPath: 'REGISTRATION.info.phoneNumber',
            label: 'Telefonní číslo',
            validations: [validationFactory('isPhoneNumber')],
        },
    },
    auth: {
        password: {
            deepPath: 'REGISTRATION.auth.password',
            required: true,
            label: 'Heslo',
            validations: [validationFactory('isString', { min: 4, max: 20 })],
        },
    },
};

export default {
    REGISTRATION,
};
