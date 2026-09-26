import { trimData } from './trimData.js';


describe('Trim data', function () {

    it('should trim all', function () {
        expect(trimData({
            name: " Martin ",
            info: {
                userName: {
                    field: " složité něco     "
                }
            }
        })).toStrictEqual({
            name: "Martin",
            info: {
                userName: {
                    field: "složité něco"
                }
            }
        });
    });
});
