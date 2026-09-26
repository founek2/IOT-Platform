import { formDataMiddlewareIsPresent, tokenMiddlewareIsPresent } from "common/__test__/helpers/middlewareChecker"
import { } from "common/__test__/helpers/accessToken"
import { getAccessToken, getToken } from "./helpers/accessToken.js";
import { credentials } from "./resources/credentials.js";
import { DeviceModel } from "common";

test('accessToken middleware', async function () {
    await tokenMiddlewareIsPresent('/api/user/123/accessToken', [
        "index",
        "create",
        "deleteId",
        "modifyId"
    ])

    const { accessToken, user } = await getToken(credentials.user)
    await formDataMiddlewareIsPresent(`/api/user/${user._id}/accessToken`, [
        "create",
        "modifyId"
    ], { accessToken })
});

test('broker middleware', async function () {
    await tokenMiddlewareIsPresent('/api/broker', [
        "index"
    ])
});

test('config middleware', async function () {
    await tokenMiddlewareIsPresent('/api/config', [
        "index",
    ])
});

test('device middleware', async function () {
    await tokenMiddlewareIsPresent('/api/device', [
        "index",
        "read",
        "modifyId",
        "createId",
        "deleteId"
    ])

    const { accessToken, user } = await getToken(credentials.user)
    await formDataMiddlewareIsPresent(`/api/device`, [
        "modifyId",
        "createId"
    ], { accessToken, id: credentials.deviceId })
});

test('discovery middleware', async function () {
    await tokenMiddlewareIsPresent('/api/discovery', [
        "index",
        "deleteId",
        "createId",
    ])

    const { accessToken, user } = await getToken(credentials.user)
    await formDataMiddlewareIsPresent(`/api/discovery`, [
        "createId"
    ], { accessToken, id: credentials.discoveryId })
});

test('notification middleware', async function () {
    await tokenMiddlewareIsPresent('/api/user/123/notification', [
        "create",
    ])

    const { accessToken, user } = await getToken(credentials.user)
    await formDataMiddlewareIsPresent(`/api/user/${user._id}/notification`, [
        "create"
    ], { accessToken })
});


test('notify middleware', async function () {
    await tokenMiddlewareIsPresent('/api/device/123/thing/123/notify', [
        "replace",
        "index",
    ])

    const { accessToken, user } = await getToken(credentials.user)
    const device = await DeviceModel.findById(credentials.deviceId)
    await formDataMiddlewareIsPresent(`/api/device/${device?._id}/thing/${device?.things[0].config.nodeId}/notify`, [
        "replace"
    ], { accessToken })
});

test('thing middleware', async function () {
    await tokenMiddlewareIsPresent('/api/device/123/thing/123', [
        "create",
        "replace",
    ])

    const { accessToken, user } = await getToken(credentials.user)
    const device = await DeviceModel.findById(credentials.deviceId)
    await formDataMiddlewareIsPresent(`/api/device/${device?._id}/thing/${device?.things[0].config.nodeId}`, [
        "replace"
    ], { accessToken })
});

test('thingState middleware', async function () {
    await tokenMiddlewareIsPresent('/api/device/123/thing/123/state', [
        "index",
    ])
});

test('user middleware', async function () {
    await tokenMiddlewareIsPresent('/api/user', [
        "index",
        "replaceId",
        "deleteId",
    ])

    const { accessToken, user } = await getToken(credentials.user)
    await formDataMiddlewareIsPresent(`/api/user`, [
        "create",
        "replaceId",
    ], { accessToken, id: user._id })
});
