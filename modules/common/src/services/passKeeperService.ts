import { Maybe, Nothing } from "purify-ts";
import { EventEmitter } from "stream";
import { BusEmitterType, Pass } from "../interfaces/asyncEmitter";

export class PassKeeper extends EventEmitter {
    pass: Maybe<Pass>
    bus: BusEmitterType

    constructor(bus: BusEmitterType) {
        super();

        this.pass = Nothing;
        this.bus = bus;

        bus.on("new_pass", (result) => {
            this.pass = result;
            this.emit("new_pass", result)
        })
    }

    getPass(): Promise<Maybe<Pass>> {
        return new Promise(res => {
            if (this.pass.isNothing()) {
                const handle = (pass: Maybe<Pass>) => {

                    this.off("new_pass", handle);
                    res(pass);
                }
                this.on("new_pass", handle);

                this.bus.emit("request_pass", undefined);
            } else {
                res(this.pass)
            }
        })
    }
}