import config from "../resources/config";
import { getTokenFactory } from "common/__test__/helpers/accessToken"

export const getToken = getTokenFactory(config.jwt);
export async function getAccessToken(options: Parameters<typeof getToken>[0]) {
    const { accessToken } = await getToken(options)

    return accessToken;
}
export async function getRefreshToken(options: Parameters<typeof getToken>[0]) {
    const { refreshToken } = await getToken(options)

    return refreshToken;
}