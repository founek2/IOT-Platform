export enum PropertyClass {
    temperature = 'temperature',
    humidity = 'humidity',
    pressure = 'pressure',
    voltage = 'voltage',
}

export enum ComponentType {
    sensor = 'sensor',
    activator = 'activator',
    switch = 'switch',
    generic = 'generic',
}

export enum PropertyDataType {
    string = 'string',
    float = 'float',
    boolean = 'boolean',
    integer = 'integer',
    color = 'color',
    enum = 'enum',
    binary = 'binary',
}

export enum StringFormat {
    httpStream = 'httpStream',
}
export interface PropertyState {
    value: string | number | boolean;
    timestamp: Date;
}

export interface IThing {
    _id?: any;
    config: {
        name: string;
        nodeId: string;
        componentType: ComponentType;
        properties: IThingProperty[];
    };
    state?: Record<string, PropertyState | undefined>;
    // state?: {
    //     timestamp: Date;
    //     value: { [propertyId: string]: string | number };
    // };
}

export type IThingProperty = IThingPropertyBase | IThingPropertyNumeric | IThingPropertyEnum;

export interface IThingPropertyBase {
    _id?: string;
    propertyId: string;
    name: string;
    propertyClass?: PropertyClass;
    unitOfMeasurement?: string;
    dataType: PropertyDataType;
    settable: boolean;
    retained?: boolean;
    format?: any;
}

export interface IThingPropertyString extends IThingPropertyBase {
    dataType: PropertyDataType.string;
    format?: StringFormat;
}
export interface IThingPropertyNumeric extends IThingPropertyBase {
    dataType: PropertyDataType.integer | PropertyDataType.float;
    format?: { min: number; max: number };
}

export interface IThingPropertyEnum extends IThingPropertyBase {
    dataType: PropertyDataType.enum;
    format: string[];
}

export interface IThingPropertyColor extends IThingPropertyBase {
    dataType: PropertyDataType.color;
    format: 'hsv' | 'rgb';
}
