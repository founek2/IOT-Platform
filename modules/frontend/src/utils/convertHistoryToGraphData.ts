import type { IThingProperty } from 'common/models/interface/thing';
import { Measurement } from 'common/types';

export function convertNumericHistoryToGraphData(data: Measurement[], propertyId: IThingProperty['propertyId']) {
    let result: { x: Array<Date>; y: Array<number> } = { x: [], y: [] };
    if (!propertyId) return result;

    data.forEach((point) => {
        if (point.propertyId == propertyId) {
            result.x.push(new Date(point._time));
            result.y.push(point._value as number);
        }
    });

    return result;
}

const ON = 'Zap.';
const OFF = 'Vyp.';
export function convertBoolHistoryToGraphData(data: Measurement[], propertyId: IThingProperty['propertyId']) {
    let result: { x: Array<Date>; y: Array<string> } = { x: [], y: [] };
    if (!propertyId) return result;

    let lastTrue: Measurement | null = null;

    data.forEach((point) => {
        if (point.propertyId == propertyId) {
            if (point._value == true) {
                if (!lastTrue) {
                    result.x.push(new Date(point._time));
                    result.y.push(OFF);
                }

                result.x.push(new Date(point._time));
                result.y.push(ON);
                lastTrue = point;
            } else if (lastTrue) {
                result.x.push(new Date(point._time));
                result.y.push(ON);
                result.x.push(new Date(point._time));
                result.y.push(OFF);
                lastTrue = null;
            }
        }
    });

    if (lastTrue) {
        result.x.push(new Date());
        result.y.push(ON);
    } else {
        result.x.push(new Date());
        result.y.push(OFF);
    }

    return result;
}
