import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AuthType } from '../constants/index.js';
import { connectMongoose } from '../utils/connectMongoose.js';
import { DeviceModel } from './deviceModel.js';
import { DiscoveryModel } from './deviceDiscoveryModel.js';
import { NotifyModel } from './notifyModel.js';
import { UserModel } from './userModel.js';
import { UserService } from '../services/userService.js';
import { JwtService } from '../services/jwtService.js';

// Oldest MongoDB server version the platform must support
const MONGODB_VERSION = '5.0.26';

let server: MongoMemoryServer;

beforeAll(async () => {
    server = await MongoMemoryServer.create({ binary: { version: MONGODB_VERSION } });
    await connectMongoose(server.getUri('models_integration'));
}, 120_000);

afterAll(async () => {
    await mongoose.disconnect();
    await server?.stop();
});

afterEach(async () => {
    await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
});

async function createUser(userName = 'test') {
    return UserModel.create({
        info: { userName, email: `${userName}@example.com` },
        auth: { types: [AuthType.passwd], password: 'hash' },
        realm: userName,
        refreshTokens: [{ createdAt: new Date(), userAgent: 'jest' }],
    });
}

async function createDevice(userId: string, deviceId = 'DEV-1') {
    return DeviceModel.createNew(
        { info: { name: 'Device' }, things: [], metadata: { realm: 'test', deviceId } },
        userId
    );
}

const randomId = () => new mongoose.Types.ObjectId().toString();

describe('UserModel', () => {
    it('applies default group', async () => {
        const user = await createUser();
        expect(user.groups).toEqual(['user']);
    });

    it('checkExists returns boolean', async () => {
        const user = await createUser();
        await expect(UserModel.checkExists(user._id.toString())).resolves.toBe(true);
        await expect(UserModel.checkExists(randomId())).resolves.toBe(false);
    });

    it('toObject hides credentials and exposes id', async () => {
        const user = await createUser();
        const plain = user.toObject();

        expect(plain.auth).toBeUndefined();
        expect(plain.accessTokens).toBeUndefined();
        expect(plain.refreshTokens).toBeUndefined();
        expect(plain._id.toString()).toBe(user._id.toString());
    });

    it('invalidateRefreshToken reports modifiedCount', async () => {
        const user = await createUser();
        const result = await UserModel.invalidateRefreshToken(user._id.toString(), user.refreshTokens![0]._id);

        expect(result.modifiedCount).toBe(1);
    });

    it('setUserDashboard persists preferences', async () => {
        const user = await createUser();
        const dashboard = { preferences: [{ propertyId: 'p1', thingId: 't1' }] };

        await UserModel.setUserDashboard(user._id.toString(), dashboard);
        const stored = await UserModel.findById(user._id).select('dashboard').lean();

        expect(stored?.dashboard).toEqual(dashboard);
    });

    it('removeUsers reports deletedCount', async () => {
        const user = await createUser();
        const result = await UserModel.removeUsers([user._id.toString()]);

        expect(result.deletedCount).toBe(1);
    });
});

describe('DeviceModel', () => {
    it('createNew stores user ids as ObjectIds', async () => {
        const user = await createUser();
        const device = await createDevice(user._id.toString());
        const stored = await DeviceModel.findById(device._id).lean();

        expect(stored!.permissions.read[0]).toBeInstanceOf(mongoose.Types.ObjectId);
        expect(stored!.createdBy).toBeInstanceOf(mongoose.Types.ObjectId);
    });

    it('toObject hides apiKey', async () => {
        const user = await createUser();
        const device = await createDevice(user._id.toString());

        expect(device.apiKey).toBeTruthy();
        expect(device.toObject().apiKey).toBeUndefined();
    });

    it('existence and permission checks return booleans', async () => {
        const user = await createUser();
        const userId = user._id.toString();
        const otherId = randomId();
        const deviceId = (await createDevice(userId))._id.toString();
        const metadata = { realm: 'test', deviceId: 'DEV-1' };

        await expect(DeviceModel.checkExists(deviceId)).resolves.toBe(true);
        await expect(DeviceModel.checkExists(randomId())).resolves.toBe(false);
        await expect(DeviceModel.checkReadPerm(deviceId, userId)).resolves.toBe(true);
        await expect(DeviceModel.checkWritePerm(deviceId, userId)).resolves.toBe(true);
        await expect(DeviceModel.checkWritePerm(deviceId, otherId)).resolves.toBe(false);
        await expect(DeviceModel.checkControlPerm(deviceId, userId)).resolves.toBe(true);
        await expect(DeviceModel.checkRealmReadPerm(metadata, userId)).resolves.toBe(true);
        await expect(DeviceModel.checkRealmControlPerm(metadata, otherId)).resolves.toBe(false);
        await expect(DeviceModel.checkIdTaken(metadata)).resolves.toBe(true);
        await expect(DeviceModel.checkExistsByMetadata('DEV-404')).resolves.toBe(false);
    });

    it('login validates apiKey', async () => {
        const user = await createUser();
        const device = await createDevice(user._id.toString());

        await expect(DeviceModel.login('test', 'DEV-1', device.apiKey)).resolves.toBe(true);
        await expect(DeviceModel.login('test', 'DEV-1', 'wrong')).resolves.toBe(false);
    });

    it('findForUser returns only related devices', async () => {
        const user = await createUser();
        const other = await createUser('other');
        await createDevice(user._id.toString(), 'DEV-1');
        await createDevice(other._id.toString(), 'DEV-2');

        const docs = await DeviceModel.findForUser(user._id.toString());

        expect(docs).toHaveLength(1);
        expect(docs[0].metadata.deviceId).toBe('DEV-1');
    });

    it('findOneAndUpdate with returnDocument after returns updated doc', async () => {
        const user = await createUser();
        await createDevice(user._id.toString());

        const updated = await DeviceModel.findOneAndUpdate(
            { 'metadata.deviceId': 'DEV-1', 'metadata.realm': 'test' },
            { 'state.status.value': 'ready' },
            { returnDocument: 'after' }
        ).lean();

        expect(updated?.state?.status?.value).toBe('ready');
    });
});

describe('NotifyModel', () => {
    it('setForThing upserts once and getForThing finds it', async () => {
        const userId = randomId();
        const deviceId = randomId();

        await NotifyModel.setForThing(deviceId, 'node', userId, []);
        await NotifyModel.setForThing(deviceId, 'node', userId, []);

        expect(await NotifyModel.countDocuments({ userId })).toBe(1);
        expect(await NotifyModel.getForThing(deviceId, 'node', userId)).toBeTruthy();
    });
});

describe('DiscoveryModel', () => {
    it('existence and permission checks return booleans', async () => {
        const discovery = await DiscoveryModel.create({ deviceId: 'DEV-2', realm: 'test' });
        const id = discovery._id.toString();

        await expect(DiscoveryModel.checkExists(id)).resolves.toBe(true);
        await expect(DiscoveryModel.checkExistsNotPairing(id)).resolves.toBe(true);
        await expect(DiscoveryModel.checkPermissions(id, 'test')).resolves.toBe(true);
        await expect(DiscoveryModel.checkPermissions(id, 'other')).resolves.toBe(false);
    });
});

describe('UserService.deleteById', () => {
    it('removes user and their device permissions', async () => {
        const user = await createUser();
        const userId = user._id.toString();
        const device = await createDevice(userId);
        const userService = new UserService({} as JwtService);

        await expect(userService.deleteById(userId)).resolves.toBe(true);

        // deleteById does not await the permission cleanup
        await new Promise((resolve) => setTimeout(resolve, 200));
        const stored = await DeviceModel.findById(device._id).lean();
        expect(stored!.permissions).toEqual({ read: [], write: [], control: [] });
    });
});
