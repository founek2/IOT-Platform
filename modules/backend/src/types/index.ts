import { ControlRecipe } from 'common/types';
import { IUser } from 'common/models/interface/userInterface';
import { JwtService } from 'common/services/jwtService';
import { UserService } from 'common/services/userService';
import { MailerService } from '../services/mailerService.js';
import { Actions } from '../services/actionsService.js';
import { BrokerService } from '../services/brokerService.js';

export interface EmitterEvents {
    user_login: IUser;
    user_signup: UserBasic;
    user_forgot: { email: IUser['info']['email'] };
    device_control_recipe_change: { recipes: ControlRecipe[]; deviceId: string };
    device_delete: string;
    device_create: string;
    devices_delete: string[];
}

export interface UserBasic {
    id: string;
    info: {
        firstName?: string;
        email: string;
        lastName?: string;
        userName: string;
    };
}

export type Context = {
    jwtService: JwtService
    userService: UserService
    mailerService: MailerService
    actionsService: Actions
    brokerService: BrokerService
}

export type HasContext = {
    context: Context
}