import { server } from '../lib/superTest';
import { getAdminToken, getUserToken } from '../lib';
import { credentials } from '../resources/credentials.js';
import forms from '../resources/forms/userForms.js';

describe('Authorization API login', function () {
    test('shoud return unknownUser', async function () {
        const res = await server
            .post('/api/authorization')
            .send(forms.login('user', 'password'))
            .expect('Content-type', /json/)
            .expect(401);
        expect(res.body).toEqual({ error: 'unknownUser' });
    });

    test('shoud return passwordMissmatch', async function () {
        const res = await server
            .post('/api/authorization')
            .send(forms.login(credentials.user.userName, 'password'))
            .expect('Content-type', /json/)
            .expect(401);
        expect(res.body).toEqual({ error: 'passwordMissmatch' });
    });

    test('shoud pass', async function () {
        const res = await server
            .post('/api/authorization')
            .send(forms.login(credentials.user.userName, credentials.user.password))
            .set('Accept', 'application/json')
            .expect('Content-type', /json/)
            .expect(200);

        expect(res.body.token).toBeTruthy();
        expect(res.body.user.info.userName).toBe(credentials.user.userName);

        await getUserToken();
        await getAdminToken();
    });
});
