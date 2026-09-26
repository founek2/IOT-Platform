import * as validationFn from './validationFn.js';
import validationFactory from './validationFactory.js';

const descriptor = {
    name: {
        deepPath: "FORM.name",
        required: true,
    },
    info: {
        userName: {
            deepPath: "FORM.info.userName",
            validations: [validationFactory("isString", { min: 2 })]
        }
    }
}

describe('Validation factory', function () {
    it('should validate String', function () {
        const fn = validationFn.isString;
        expect(fn([])).toEqual("notString");
        expect(fn(3)).toEqual('notString');
        expect(fn({})).toEqual('notString');

        expect(validationFn.isString('ble', { min: 3, max: 10 })).toEqual(true);
        expect(validationFn.isString('1234567891', { min: 3, max: 10 })).toEqual(true);
        expect(validationFn.isString('b', { min: 3, max: 10 })).toEqual('lowerLength');
        expect(validationFn.isString('blablablablabla', { min: 3, max: 10 })).toEqual('higherLength');
        expect(validationFn.isString('b', { startsWith: '/' })).toEqual('notStartsWith');
    });

    it('should validate Number', function () {
        const fn = validationFn.isNumber;
        expect(fn([])).toEqual('notNumber');
        expect(fn(3)).toEqual(true);
        expect(fn(3.3232)).toEqual(true);
        expect(fn('3.3232')).toEqual(true);
        expect(fn('3')).toEqual(true);
        expect(fn({})).toEqual('notNumber');
        expect(fn('')).toEqual('notNumber');
        expect(fn('3.333ds')).toEqual('notNumber');
        expect(fn('!3.333')).toEqual('notNumber');
        expect(fn('!3.a33')).toEqual('notNumber');

        expect(validationFn.isNumber(10, { min: 3, max: 10 })).toEqual(true);
        expect(validationFn.isNumber(3, { min: 3, max: 10 })).toEqual(true);
        expect(validationFn.isNumber(1, { min: 3, max: 10 })).toEqual('lowerValue');
        expect(validationFn.isNumber(11, { min: 3, max: 10 })).toEqual('higherValue');
    });

    it('should validate Bool', function () {
        const fn = validationFn.isBool;
        expect(fn(false)).toEqual(true);
        expect(fn(true)).toEqual(true);
        expect(fn('false')).toEqual(true);
        expect(fn('true')).toEqual(true);

        expect(validationFn.isBool(6)).toEqual('notBool');
        expect(validationFn.isBool([])).toEqual('notBool');
        expect(validationFn.isBool({})).toEqual('notBool');
        expect(validationFn.isBool('')).toEqual('notBool');
        expect(validationFn.isBool('dsad')).toEqual('notBool');
    });

    it('should validate noNumbers', function () {
        const fn = validationFn.noNumbers;
        expect(fn(false)).toEqual(true);
        expect(fn(true)).toEqual(true);
        expect(fn([])).toEqual(true);
        expect(fn({})).toEqual(true);

        expect(validationFn.noNumbers(6)).toEqual('cannotContainNumbers');
        expect(validationFn.noNumbers('adsad3dasd')).toEqual('cannotContainNumbers');
    });

    it('should validate phone number', function () {
        const fn = validationFn.isPhoneNumber;
        expect(fn('732426100')).toEqual(true);
        expect(fn('+420 732426100')).toEqual(true);
        expect(fn('+420 732 426100')).toEqual(true);
        expect(fn('+420 732426 100')).toEqual(true);
        expect(fn('+420 732 426 100')).toEqual(true);
        expect(fn('+420732426 100')).toEqual(true);
        expect(fn('+420732 426 100')).toEqual(true);
        expect(fn('+420732426 100')).toEqual(true);

        expect(validationFn.isPhoneNumber(6)).toEqual('isNotPhoneNumber');
        expect(validationFn.isPhoneNumber([])).toEqual('isNotPhoneNumber');
        expect(validationFn.isPhoneNumber({})).toEqual('isNotPhoneNumber');
        expect(validationFn.isPhoneNumber('382 322 31')).toEqual('isNotPhoneNumber');
        expect(validationFn.isPhoneNumber('+42382 322 31')).toEqual('isNotPhoneNumber');
    });

    it('should validate email', function () {
        const fn = validationFn.isEmail;
        expect(fn('skalic@seznam.cz')).toEqual(true);
        expect(fn('s@s.cz')).toEqual(true);

        expect(fn('s233!2@gmail.com')).toEqual('isNotEmail');
        expect(fn('s@s.c')).toEqual('isNotEmail');
        expect(fn('ssdads.com')).toEqual('isNotEmail');
        expect(fn('ssda@dscom')).toEqual('isNotEmail');
        expect(fn('ss3da@ds!.com')).toEqual('isNotEmail');
    });

    it('should validate array', function () {
        const fn = validationFn.isArray;

        const validObj = { name: "bleble", info: { userName: "aa" } };
        expect(fn([])).toEqual(true);
        expect(fn([1], { min: 1 })).toEqual(true);
        expect(fn([1, 2, 3], { min: 1 })).toEqual(true);

        expect(fn([1, 2, 3], { max: 10 })).toEqual(true);
        expect(fn([1, 2, 3], { max: 3 })).toEqual(true);
        expect(fn([{ name: "bleble" }], {
            descriptor
        })).toEqual(true);
        expect(fn([validObj], {
            descriptor
        })).toEqual(true);

        expect(fn([1], { min: 2 })).toEqual("lowerLength");
        expect(fn([1, 2, 3, 1], { max: 3 })).toEqual("higherLength");
        expect(fn([{ ahoj: "bleble" }], {
            descriptor
        })).toEqual("isNotValidObject");
        expect(fn([{ name: "bleble", info: { userName: "a" } }], {
            descriptor
        })).toEqual("isNotValidObject");
        expect(fn([validObj, {}], {
            descriptor
        })).toEqual("isNotValidObject");
    });

    it('should validate object', function () {
        const fn = validationFn.isObject;

        const validObj = { name: "bleble", info: { userName: "aa" } };
        expect(fn({})).toEqual(true);
        expect(fn(validObj, { descriptor })).toEqual(true);
        expect(fn({ name: "ahoj" }, { descriptor })).toEqual(true);

        expect(fn({}, { descriptor })).toEqual("isNotValidObject");
        expect(fn({ name: "ahoj", over: "zbytečné", things: [{ ahoj: "b" }] }, { descriptor })).toEqual("isNotValidObject");
        expect(fn({ name: "ahoj", things: [{ ahoj: "b" }] }, { descriptor })).toEqual("isNotValidObject");
    });
});
