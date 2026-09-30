import { UserModel } from 'common';
import { server } from './helpers/superTest';
import { credentials } from './resources/credentials';
import forms from './resources/forms/userForms';

async function sendSignIn(userName: string, password: string): Promise<{ accessToken: string, refreshToken: string }> {
    const res = await server
        .post('/api/auth/user/signIn')
        .send(forms.login(userName, password))
        .set('Accept', 'application/json')
        .expect('Content-type', /json/)
        .expect(200);


    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
    expect(res.body.user.info.userName).toBe(userName);
    expect(res.body.user._id).toBeTruthy();
    expect(res.body.user).not.toHaveProperty('auth');
    expect(res.body.user).not.toHaveProperty('accessTokens');
    expect(res.body.user).not.toHaveProperty('refreshTokens');

    return res.body;
}

export async function signOut(userName: string) {
    const n = await UserModel.updateOne({
        "info.userName": userName,
    }, {
        refreshTokens: []
    });
    expect(n.nModified).toBe(1)
}

describe('SignIn API', function () {
    test('shoud return unknownUser', async function () {
        const res = await server
            .post('/api/auth/user/signIn')
            .send(forms.login('user', 'password'))
            .expect('Content-type', /json/)
            .expect(401);

        expect(res.body).toEqual({ error: 'unknownUser' });
    });

    test('shoud return passwordMissmatch', async function () {
        const res = await server
            .post('/api/auth/user/signIn')
            .send(forms.login(credentials.user.userName, 'password'))
            .expect('Content-type', /json/)
            .expect(401);
        expect(res.body).toEqual({ error: 'passwordMissmatch' });
    });

    test('shoud signIn user', async function () {
        await sendSignIn(credentials.user.userName, credentials.user.password)

        const user = await UserModel.findByUserName(credentials.user.userName);
        expect(user!.refreshTokens).toHaveLength(1);
        expect(user!.refreshTokens![0].validTo).toBeUndefined();
        await signOut(credentials.user.userName)
    });

    test('shoud signIn admin', async function () {
        await sendSignIn(credentials.admin.userName, credentials.admin.password)

        const user = await UserModel.findByUserName(credentials.admin.userName);
        expect(user!.refreshTokens).toHaveLength(1);
        expect(user!.refreshTokens![0].validTo).toBeUndefined();
        await signOut(credentials.admin.userName)
    });

    test('shoud invalidate signIn token', async function () {
        const { accessToken } = await sendSignIn(credentials.user.userName, credentials.user.password)
        await sendSignIn(credentials.user.userName, credentials.user.password)
        await sendSignIn(credentials.user.userName, credentials.user.password)
        const user = await UserModel.findByUserName(credentials.user.userName);

        await server
            .delete('/api/auth/user/signIn/' + user!.refreshTokens![1]._id)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(204);


        const userUpdated = await UserModel.findByUserName(credentials.user.userName);
        expect(userUpdated!.refreshTokens).toHaveLength(3);
        expect(userUpdated!.refreshTokens![0].validTo).toBeUndefined();
        expect(userUpdated!.refreshTokens![1].validTo!.getTime()).toBeLessThan(Date.now());
        expect(userUpdated!.refreshTokens![2].validTo).toBeUndefined();

        await signOut(credentials.user.userName)
    });

    test('shoud return all active sessions', async function () {
        const { accessToken } = await sendSignIn(credentials.user.userName, credentials.user.password)
        await sendSignIn(credentials.user.userName, credentials.user.password)
        await sendSignIn(credentials.user.userName, credentials.user.password)

        const res = await server
            .get('/api/auth/user/signIn/active')
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        expect(res.body.activeRefreshTokens).toHaveLength(3);

        const signIn = res.body.activeRefreshTokens[0];
        expect(signIn._id).toBeTruthy();
        expect(signIn.createdAt).toBeTruthy();

        await signOut(credentials.user.userName)
    });
});
