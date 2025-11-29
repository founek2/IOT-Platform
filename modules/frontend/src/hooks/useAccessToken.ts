import parseJwt from "common/lib/utils/parseJwtToken";
import { useEffect, useState } from 'react';
import internalStorage, { AccessTokenData } from '../services/internalStorage';

export function useAccessToken() {
    const [accessToken, setAccessToken] = useState<AccessTokenData>()

    useEffect(() => {
        const token = internalStorage.getAccessToken()
        setAccessToken(token)

        internalStorage.on("new_access_token", (token) => setAccessToken(token))
    }, [internalStorage, setAccessToken])

    return { accessToken, payload: accessToken ? parseJwt(accessToken?.token) : undefined }
}
