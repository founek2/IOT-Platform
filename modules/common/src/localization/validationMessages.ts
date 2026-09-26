import { messageFactory } from './index.js';

export const messages = {
    notString: 'Zadaná hodnota musí být text',
    higherLength: ({ max }: any) => `Text nesmí být delší než ${max}`,
    lowerLength: ({ min }: any) => `Text nesmí být kratší než ${min}`,
    lowerValue: ({ min }: any) => `Hodnota nesmí být nižší než ${min}`,
    higherValue: ({ max }: any) => `Hodnota nesmí být vyšší než ${max}`,
    notStartsWith: ({ startsWith }: any) => `Text musí začínat s '${startsWith}'`,
    stringCannotEqualTo: ({ notEqual }: any) => `Text nesmí být '${notEqual}'`,
    notNumber: `Zadaná hodnota musí být číslo`,
    isNotTime: `Zadaná hodnota musí být čas ve tvaru HH:MM`,
    isRequired: 'Toto pole je povinné',
    isNotPhoneNumber: 'Telefoní číslo nemá správný formát',
    isNotEmail: 'Email nemá správný formát',
    cannotContainNumbers: 'Hodnota nesmí obsahovat čísla',
    isNotFile: 'Nahrajte soubor',
    notBool: 'Hodnota musí být true/false',
    isNotIpAddress: 'Hodnota není IP adresa',
    isNotOneOf: ({ values }: any) => 'Hodnota musí být jedna z ' + values.map((obj: any) => obj.label).join(', '),
    notMatchPattern: ({ pattern }: any) => `Text musí být ve tvaru '${pattern}'`,
    isNotObject: 'Hodnota musí být Objekt',
    isNotValidObject: 'Objekt není ve správném formátu',
    isNotColor: 'Hodnota musí být barva v hex',
};

export type validationMessageKey = keyof typeof messages;
export default messageFactory(messages);
