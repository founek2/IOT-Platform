import { Security } from 'common/services/SecurityService';
import { addMinutes } from 'date-fns/addMinutes';
import { isBefore } from 'date-fns/isBefore';
import { UserModel } from 'common/models/userModel';
import { Maybe, Just, Nothing } from 'purify-ts/Maybe';
import { logger } from 'common/logger';
import { BusEmitterType, Pass } from "common/interfaces/asyncEmitter"
import { Config } from '../config.js';

async function generatePass(): Promise<Maybe<Pass>> {
    logger.debug('Generating new pass');
    const token = Security.getRandomToken(12);
    const doc = await UserModel.findOne({ groups: 'root' }).lean();
    if (!doc?.info.userName) return Nothing;

    return Just({ validTo: addMinutes(new Date(), 60), userName: doc.info.userName, password: token });
}

export class TemporaryPass {
    private currentPass: Maybe<Pass> = Nothing;
    private bus: BusEmitterType
    private config?: Config["mqtt"]

    constructor(bus: BusEmitterType, config?: Config["mqtt"]) {
        this.bus = bus;
        this.config = config;

        this.bus.on("request_pass", () => {
            this.emitPass()
        });
        this.emitPass();
        setInterval(() => this.emitPass(), 50 * 60 * 1000)
    }

    async emitPass() {
        if (this.config?.userName && this.config.password) {
            this.bus.emit("new_pass", Just({ validTo: addMinutes(new Date(), 60), userName: this.config.userName, password: this.config.password }))
        } else {
            this.currentPass = await generatePass();
            this.bus.emit("new_pass", this.currentPass)
        }
    }

    // async getPass(): Promise<Maybe<Pass>> {
    //     this.currentPass = await new Promise((res) => {
    //         this.currentPass
    //             .ifJust(async (pass) => (pass.validTo <= new Date() ? res(await generatePass()) : res(Just(pass))))
    //             .ifNothing(async () => res(await generatePass()));
    //     });
    //     return this.currentPass;
    // }

    validatePass(pass: { userName: string; password: string }): boolean {
        return this.currentPass
            .map((curr) => isBefore(new Date(), curr.validTo) && curr.password === pass.password)
            .orDefault(false);
    }

}

