import validationFactory from './validationFactory.js';


describe('Validation factory', function () {

    it('should check validationFactory', function (done) {
        expect(validationFactory('isString')('kekel')).toEqual(true);

        try {
            // @ts-ignore
            validationFactory('noNumbessadas')('kekel');
        } catch (err) {
            if (err instanceof Error && err.message === 'Missing validation Fn named: noNumbessadas') done();
        }
    });
});
