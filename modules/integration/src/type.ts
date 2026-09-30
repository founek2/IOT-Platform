export enum PropertyClass {
    Temperature = 'temperature',
    Humidity = 'humidity',
    Pressure = 'pressure',
    Voltage = 'voltage',
}
export enum DeviceCommand {
    restart = 'restart',
    reset = 'reset',
}

export enum ComponentType {
    sensor = 'sensor',
    generic = 'generic',
    switch = 'switch',
    activator = 'activator',
}

export const NodeProperties = {
    [ComponentType.switch]: ['power'],
};

export enum PropertyDataType {
    string = 'string',
    float = 'float',
    boolean = 'boolean',
    integer = 'integer',
    enum = 'enum',
    color = 'color',
    binary = 'binary',
}