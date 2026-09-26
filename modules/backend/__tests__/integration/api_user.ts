import should from 'should';
import forms from '../resources/forms/userForms.js';
import { server } from '../lib/superTest';

import { UserModel } from 'common/models/userModel';
import permMiddlewareChecker from '../lib/authMiddlewareCheck';
import { getAdminToken, getUserToken } from '../lib/tokens';
import mongoose from 'mongoose';
import { credentials } from '../resources/credentials.js';
import { toPairs, assocPath } from 'ramda';
import { IUser } from 'common/models/interface/userInterface';

async function createUser10(): Promise<{ token: string; user: IUser }> {
    const res = await server // create user: test10
        .post('/api/user')
        .send(forms.registration_form_test10)
        .set('Accept', 'application/json')
        .set('Accept', 'application/json')
        .expect('Content-type', /json/)
        .expect(200); // THis is HTTP response

    should(res.body.user.info).be.eql(forms.registration_form_test10.formData.REGISTRATION.info);
    should.equal(res.body.user.info.userName, res.body.user.info.userName);
    should.exist(res.body.token);

    return { user: res.body.user, token: 'Berear ' + res.body.token };
}

const randomObjectId = '507f1f77bcf86cd799439011';

describe('User API index', function () {
    it('should list all userNames2', async function () {
        const { token } = await getUserToken();
        const res = await server
            .get('/api/user')
            .query({ type: 'userName' })
            .set('Authorization', token)
            .expect('Content-type', /json/)
            .expect(200);

        expect(res.body.data).toEqual(
            expect.arrayContaining(
                [credentials.user, credentials.admin].map(({ userName }) => expect.objectContaining({ userName }))
            )
        );
    });

    it('should fail without token', async function () {
        const res = await server.get('/api/user').expect('Content-type', /json/).expect(400);
        expect(res.body).toEqual({ error: 'tokenNotProvided' });
    });

    it('should fail list of all users for regular user', async function () {
        const { token } = await getUserToken();
        const res = await server
            .get('/api/user')
            .set('Authorization', token)
            .expect('Content-type', /json/)
            .expect(403);
        expect(res.body).toEqual({ error: 'InvalidPermissions' });
    });

    it('should pass for admin', async function () {
        const { token } = await getAdminToken();

        const res = await server
            .get('/api/user')
            .set('Accept', 'application/json')
            .set('Authorization', token)
            .expect('Content-type', /json/)
            .expect(200);

        expect(res.body.docs).toEqual(
            expect.arrayContaining(
                [credentials.user].map((obj) =>
                    expect.objectContaining({
                        info: expect.objectContaining({
                            userName: obj.userName,
                        }),
                    })
                )
            )
        );
    });

    it('should fail validation - no userName', async function () {
        const res = await server
            .post('/api/user')
            .send(forms.registration_form_no_username)
            .set('Accept', 'application/json')
            .expect('Content-type', /json/)
            .expect(400); // THis is HTTP response

        expect(res.body).toEqual({ error: 'validationFailed' });
    });

    it('should fail validation - extra field', async function () {
        const res = await server
            .post('/api/user')
            .send(forms.registration_form_extra_field)
            .set('Accept', 'application/json')
            .expect('Content-type', /json/)
            .expect(400); // THis is HTTP response

        expect(res.body).toEqual({ error: 'validationFailed' });
    });
});

describe('User API read', function () {
    it('should return authType', async function () {
        const doc = await UserModel.findOne({ 'info.userName': credentials.user.userName }).lean();

        const res = await server
            .get('/api/user/' + credentials.user.userName)
            .query({ attribute: 'authType' })
            .set('Accept', 'application/json')
            .expect('Content-type', /json/)
            .expect(200); // THis is HTTP response

        expect(res.body).toEqual({ authTypes: doc?.auth.types });
    });

    it('should fail with unkown user', async function () {
        const res = await server
            .get('/api/user/' + randomObjectId)
            .query({ attribute: 'authType' })
            .set('Accept', 'application/json')
            .expect('Content-type', /json/)
            .expect(404); // THis is HTTP response

        expect(res.body).toEqual({ error: 'unknownUser' });
    });

    it('should fail without specified attribute', async function () {
        const res = await server
            .get('/api/user/' + randomObjectId)
            .set('Accept', 'application/json')
            .expect(400); // THis is HTTP response
    });
});

describe('User API create', function () {
    it('should create user: test10', async function () {
        return createUser10().finally(async () => {
            // cleaning
            const result = await UserModel.deleteOne({
                'info.userName': forms.registration_form_test10.formData.REGISTRATION.info.userName,
            }).exec();
            expect(result.n).toBe(1);
        });
    });
});

describe('User API delete', function () {
    it('should delete user: test10', async function () {
        return createUser10()
            .then(async ({ user, token }) => {
                await server // delete user
                    .delete('/api/user/' + user._id)
                    .set('Authorization', token)
                    .expect(204);
            })
            .finally(async () => {
                // cleaning
                const result = await UserModel.deleteOne({
                    'info.userName': forms.registration_form_test10.formData.REGISTRATION.info.userName,
                }).exec();
            });
    });

    it('should return uknownUser', async function () {
        const { token } = await getAdminToken();

        const res = await server // delete user
            .delete('/api/user/' + randomObjectId)
            .set('Authorization', token)
            .expect(404);

        expect(res.body).toEqual({ error: 'userNotExist' });
    });

    it('should return invalid permissions', async function () {
        const { token } = await getUserToken();
        const doc = await UserModel.findOne({ 'info.userName': credentials.admin.userName });

        const res = await server // delete user
            .delete('/api/user/' + doc?._id)
            .set('Authorization', token)
            .expect(403);

        expect(res.body).toEqual({ error: 'InvalidPermissions' });
    });
});

describe('User API replace', function () {
    it('should change userName', async function () {
        return createUser10()
            .then(async ({ user, token }) => {
                await server // delete user
                    .put('/api/user/' + user._id)
                    .set('Authorization', token)
                    .send(forms.update_user_test10_lastName)
                    .expect(204);
            })
            .finally(async () => {
                // cleaning
                await UserModel.deleteOne({
                    'info.userName': forms.registration_form_test10.formData.REGISTRATION.info.userName,
                }).exec();
            });
    });

    it('should not allow escalate permissions', async function () {
        return createUser10()
            .then(async ({ user, token }) => {
                const res = await server // delete user
                    .put('/api/user/' + user._id)
                    .set('Authorization', token)
                    .send(
                        assocPath(
                            ['formData', 'EDIT_USER', 'groups'],
                            ['admin', 'user'],
                            forms.update_user_test10_lastName
                        )
                    )
                    .expect(403);
                // expect({ body: res.body, token }).toBe(3);
            })
            .finally(async () => {
                // cleaning
                await UserModel.deleteOne({
                    'info.userName': forms.registration_form_test10.formData.REGISTRATION.info.userName,
                }).exec();
            });
    });

    it('should add firebaseToken', async function () {
        return getUserToken()
            .then(async ({ user, token }) => {
                const res = await server // delete user
                    .put('/api/user/' + user._id)
                    .set('Authorization', token)
                    .send(forms.add_firebase_token)
                    .expect(204);

                const doc = await UserModel.findOne({ _id: user._id }).lean();
                expect(doc?.notifyTokens).toEqual([forms.add_firebase_token.formData.FIREBASE_ADD.token]);
            })
            .finally(async () => {
                // cleaning
                await UserModel.updateOne(
                    {
                        'info.userName': credentials.user.userName,
                    },
                    {
                        notifyTokens: [],
                    }
                ).exec();
            });
    });
});
