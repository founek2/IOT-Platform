import { BackendEmitter } from "../services/eventEmitter.js";
import user from "./user.js";
import device from "./device.js";
import Agenda from "agenda";
import { UserService } from "common/services/userService";

export default function (eventEmitter: BackendEmitter, agenda: Agenda, userService: UserService) {
	user(eventEmitter, agenda, userService);
	device(eventEmitter, agenda);
}
