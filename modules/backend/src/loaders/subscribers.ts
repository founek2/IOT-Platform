import Agenda from 'agenda';
import { UserService } from 'common/services/userService';
import eventEmitter from '../services/eventEmitter.js';
import init from '../subscribers/index.js';

/* Initialize event subscribers */
export default async (agenda: Agenda, userService: UserService) => {
    init(eventEmitter, agenda, userService);
};
