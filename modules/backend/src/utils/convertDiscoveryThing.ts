import { IDiscoveryThing } from 'common/models/interface/discovery';
import {
    IThingProperty,
    PropertyDataType,
    IThingPropertyNumeric,
    IThingPropertyEnum,
    IThing,
} from 'common/models/interface/thing';
import { assoc, assocPath, dissocPath, map, o } from 'ramda';

export function convertProperty(property: IThingProperty): IThingProperty {
    property = assoc('settable', Boolean(property.settable), property);

    if (!('format' in property)) return property;

    if (
        property.format &&
        (property.dataType === PropertyDataType.float || property.dataType === PropertyDataType.integer)
    ) {
        const range = (property.format as unknown as string).split(':').map(Number);
        return assoc('format', { min: range[0], max: range[1] }, property) as IThingPropertyNumeric;
    } else if (property.dataType === PropertyDataType.enum)
        return assoc(
            'format',
            (property.format! as unknown as string).split(','),
            property
        ) as unknown as IThingPropertyEnum;

    return property as IThingProperty;
}

export function convertDiscoveryThing(thing: IDiscoveryThing): IThing {
    const thingConverted = o(
        dissocPath(['config', 'propertyIds']),
        assocPath(
            ['config', 'properties'],
            map(
                o(convertProperty, (propertyId) =>
                    assocPath(['propertyId'], propertyId, thing.config.properties[propertyId])
                ),
                (thing.config.propertyIds || []).filter(Boolean)
            )
        )
    )(thing) as unknown as IThing;

    // Fill settable with default false
    thingConverted.config.properties = thingConverted.config.properties.map((property) =>
        property.settable ? property : { ...property, settable: false }
    );

    return thingConverted;
}
