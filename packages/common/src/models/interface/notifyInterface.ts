import { IDevice } from "./device";
import { IThing, IThingProperty } from "./thing";

export enum NotifyType {
	always = "always",
	below = "below",
	over = "over",
}

export interface INotifyThingProperty {
	propertyId: IThingProperty["propertyId"];
	type: NotifyType;
	value: string | number;
	advanced: {
		interval: number;
		from: string;
		to: string;
		daysOfWeek: number[];
	};
	tmp: {
		lastSendAt: Date;
		lastSatisfied: Boolean;
	};
}

export interface INotifyThing {
	nodeId: IThing["config"]["nodeId"];
	properties: INotifyThingProperty[];
}

export interface INotify {
	_id?: any;
	deviceId: IDevice["_id"];
	userId: string;
	things: INotifyThing[];
}
