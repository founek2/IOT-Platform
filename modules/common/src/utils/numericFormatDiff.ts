import { IThingPropertyNumeric } from "../models/interface/thing";

export function numericFormatDiff(property: IThingPropertyNumeric) {
    if (!property.format) return 0;

    return property.format.max - property.format.min;
}
