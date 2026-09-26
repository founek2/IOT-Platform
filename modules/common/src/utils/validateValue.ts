import { IThingProperty, PropertyDataType, IThingPropertyEnum, IThingPropertyNumeric } from '../models/interface/thing.js';

/**
 * Check whether value is valid as state of property
 */
export function validateValue(
    property: IThingProperty,
    valueBuff: Buffer
): { valid: true; value: string | number } | { valid: false } {
    if (property.dataType === PropertyDataType.float) {
        const val = parseFloat(valueBuff.toString());
        return !Number.isNaN(val) && isInRange(val, (property as IThingPropertyNumeric).format)
            ? { valid: true, value: val }
            : { valid: false };
    }

    if (property.dataType === PropertyDataType.integer) {
        const val = parseInt(valueBuff.toString());
        return !Number.isNaN(val) && isInRange(val, (property as IThingPropertyNumeric).format)
            ? { valid: true, value: val }
            : { valid: false };
    }

    if (property.dataType === PropertyDataType.enum) {
        const value = valueBuff.toString()
        return (property as IThingPropertyEnum).format.includes(value)
            ? { valid: true, value }
            : { valid: false };
    }
    if (property.dataType === PropertyDataType.boolean) {
        const value = valueBuff.toString()
        return value === 'true' || value === 'false' ? { valid: true, value } : { valid: false };
    }
    if (property.dataType === PropertyDataType.string) {
        const value = valueBuff.toString()
        return { valid: true, value };
    }

    if (property.dataType === PropertyDataType.binary) {
        const value = valueBuff.toString("base64");
        return { valid: true, value };
    }

    if (property.dataType === PropertyDataType.color) {
        const value = valueBuff.toString();
        const channels = value.split(',');
        if (channels.length !== 3 || !channels.every((val) => parseInt(val) >= 0)) return { valid: false };

        return { valid: true, value };
    }

    return { valid: false };
}

function isInRange(value: number, format: IThingPropertyNumeric['format']): boolean {
    if (!format) return true;

    return value >= format.min && value <= format.max;
}
