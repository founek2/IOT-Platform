import { IThing, IThingProperty } from "common/models/interface/thing";

export function renderTemplate(templateText: string, options: { value: string | boolean | number, property: IThingProperty, deviceThing: IThing }) {
    options.deviceThing.config.name;

    return templateText
        .replaceAll("${value}", String(options.value))
        .replaceAll("${thing.name}", options.deviceThing.config.name)
        .replaceAll("${property.name}", options.property.name)
        .replaceAll("${unit}", options.property.unitOfMeasurement || "")
}