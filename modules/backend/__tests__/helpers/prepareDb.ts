import mongoose from 'mongoose';
import { connectMongoose } from 'common/utils/connectMongoose';
import { credentials } from '../resources/credentials.js';
import { UserService } from 'common/services/userService';
import { AuthType } from 'common/constants';
import config from '../resources/config.js';
import { JwtService } from 'common/services/jwtService';
import { DeviceModel, DiscoveryModel } from 'common';

export default async () => {
    const jwtService = new JwtService(config.jwt);
    const userService = new UserService(jwtService);

    await userService.create({
        info: {
            firstName: 'Root',
            lastName: 'Something',
            userName: credentials.root.userName,
            email: credentials.root.email,
        },
        auth: {
            types: [AuthType.passwd],
            password: credentials.root.password,
        },
    }); // admin

    // first created is always admin
    const data = await userService.create({
        info: {
            firstName: 'administrator',
            lastName: 'admin',
            userName: credentials.admin.userName,
            email: credentials.admin.email,
        },
        auth: {
            types: [AuthType.passwd],
            password: credentials.admin.password,
        },
    }); // admin
    userService.updateUser(data.doc._id, { groups: ['admin'] });

    const user = await userService.create({
        info: {
            firstName: 'testik',
            lastName: 'user',
            userName: credentials.user.userName,
            email: credentials.user.email,
        },
        auth: {
            types: [AuthType.passwd],
            password: credentials.user.password,
        },
    }); // basic user

    await DeviceModel.create(credentials.device(user.doc))
    await DiscoveryModel.create(credentials.discoveryDevice(user.doc))
};
