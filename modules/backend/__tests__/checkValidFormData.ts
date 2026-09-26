import { checkValidFormData } from 'common/utils/validation';
import forms from './resources/forms/userForms.js';
import fieldDescriptors from './resources/fieldDescriptors.js';

describe('Check valid formData', function () {
    it('should validate form - valid', function (done) {
        expect(checkValidFormData(forms.registration_form_test10, fieldDescriptors)).toEqual({
            valid: true,
            errors: [],
        });
        done();
    });

    it('should validate form - missing field', function (done) {
        expect(checkValidFormData(forms.registration_form_no_username, fieldDescriptors)).toEqual({
            valid: false,
            errors: [
                {
                    'REGISTRATION.info.userName': ['Toto pole je povinné'],
                },
            ],
        });
        done();
    });

    it('should validate form - ignore required', function (done) {
        expect(checkValidFormData(forms.registration_form_no_username, fieldDescriptors, true)).toEqual({
            valid: true,
            errors: [],
        });
        done();
    });

    it('should validate form - extra field', function (done) {
        expect(checkValidFormData(forms.registration_form_extra_field, fieldDescriptors)).toEqual({
            valid: false,
            errors: [
                {
                    'REGISTRATION.hobby': ['missingDescriptor'],
                },
            ],
        });
        done();
    });
});
