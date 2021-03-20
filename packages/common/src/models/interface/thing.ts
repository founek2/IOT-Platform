export enum PropertyClass {
	temperature = "temperature",
	humidity = "humidity",
	pressure = "pressure",
	voltage = "voltage",
}

export enum ComponentType {
	sensor = "sensor",
	// BinarySensor = "binary_sensor",
	switch = "switch",
	generic = "generic",
}

export enum PropertyDataType {
	string = "string",
	float = "float",
	boolean = "boolean",
	integer = "integer",
	enum = "enum",
}

export enum PredefinedComponentType {
	switch = ComponentType.switch,
}

export const ThingProperties: {
	[componentType in PredefinedComponentType]: Array<IThingProperty>;
} = {
	[PredefinedComponentType.switch]: [
		{
			propertyId: "power",
			name: "Zapnuto",
			dataType: PropertyDataType.enum,
			format: ["on", "off"],
			settable: true,
		} as IThingPropertyEnum,
	],
};

export interface IThing {
	_id?: any;
	config: {
		name: string;
		nodeId: string;
		componentType: ComponentType;
		properties: IThingProperty[];
	};
	state?: {
		timestamp: Date;
		value: any;
	};
}

export interface IThingProperty {
	_id?: string;
	propertyId: string;
	name: string;
	propertyClass?: PropertyClass;
	unitOfMeasurement?: string;
	dataType: PropertyDataType;
	settable: boolean;
}

export interface IThingPropertyNumeric extends IThingProperty {
	dataType: PropertyDataType.integer | PropertyDataType.float;
	format?: { from: number; to: number };
}

export interface IThingPropertyEnum extends IThingProperty {
	dataType: PropertyDataType.enum;
	format?: string[];
}

// export interface IThingSensor {
// 	_id?: any;
// 	config: {
// 		name: string;
// 		nodeId: string;
// 		componentType: ComponentType.sensor;
// 		properties: [IThingProperty];
// 	};
// 	state?: {
// 		timeStamp: Date;
// 		value: any;
// 	};
// }
