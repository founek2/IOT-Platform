import { JwtService, InfluxService, UserService } from "common";
import { MqttService } from "../services/mqtt.js";

export interface UpdateThingState {
    _id: string;
    state: any;
}
export type Context = {
    influxService: InfluxService,
    jwtService: JwtService
    mqttService: MqttService
    userService: UserService
}

export type HasContext = {
    context: Context
}