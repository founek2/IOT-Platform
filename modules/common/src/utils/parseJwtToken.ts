import { Buffer } from 'buffer';

export default function parseJwt(token: string): { iat: number; exp: number, iss?: string, sub?: string } {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // @ts-ignore
    if (typeof window !== 'undefined') {
        // Runnin in browser

        // @ts-ignore
        return JSON.parse(window.atob(base64))
    }

    const buffer = Buffer.from(base64, "base64")
    return JSON.parse(buffer.toString());
}
