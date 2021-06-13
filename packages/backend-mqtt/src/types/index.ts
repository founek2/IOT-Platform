export interface Config {
    homepage: string;
    portAuth: number;
    firebaseAdminPath?: string;
    dbUri: string;
    jwt: {
        privateKey: string;
        publicKey: string;
        expiresIn: string;
    };
    mqtt: {
        url: string;
        port: number;
    };
    testUser: string;
    testPassword: string;
}

export interface UpdateThingState {
    _id: string;
    state: any;
}
