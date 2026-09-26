import { IThing } from 'common/models/interface/thing';
import { clone, omit } from 'ramda';

export type ThingPlainConfig = IThing['config'] & { properties: Omit<IThing['config']['properties'], '_id'>[] };
export function extractPlainConfig(thing: IThing): ThingPlainConfig {
    const newThing = clone(thing.config);
    // console.log('thing', newThing);
    newThing.properties = newThing.properties
        .map((property) => omit(['_id'], property))
        .map((property) => (property.settable ? property : { ...property, settable: false }));
    // console.log('thing', newThing);

    return newThing as ThingPlainConfig;
}
