import { INotifyThingProperty, NotifyType } from '../models/interface/notifyInterface.js';

interface INotifyFE {
    propertyId: string[];
    type: NotifyType[];
    value: any[];
    count: number;
    textTemplate: string[];
    advanced: {
        interval: number[];
        from: string[];
        to: string[];
        daysOfWeek: number[][];
    };
}
/**
 * Transform notify form from FE to BE representation
 */
export function transformNotifyForBE({ propertyId = [], type = [], value = [], textTemplate = [], count, advanced }: INotifyFE) {
    const resultArr = [];
    for (let i = 0; i < count; i++) {
        resultArr.push({
            propertyId: propertyId[i],
            type: type[i],
            value: value[i],
            textTemplate: textTemplate[i],
            advanced: {
                interval: advanced?.interval[i],
                daysOfWeek: advanced?.daysOfWeek[i],
                from: advanced?.from[i],
                to: advanced?.to[i],
            },
        });
    }

    return { properties: resultArr };
}

/**
 * Transform notify BE representation to FE form
 */
export function transformNotifyForFE(arrayOfNotify: INotifyThingProperty[]) {
    const len = arrayOfNotify.length;
    const resultObj: INotifyFE = {
        propertyId: [],
        type: [],
        value: [],
        textTemplate: [],
        count: len,
        advanced: {
            interval: [],
            from: [],
            to: [],
            daysOfWeek: [],
        },
    };
    for (let i = 0; i < len; i++) {
        resultObj['propertyId'].push(arrayOfNotify[i].propertyId);
        resultObj['type'].push(arrayOfNotify[i].type);
        resultObj['value'].push(arrayOfNotify[i].value);
        resultObj['textTemplate'].push(arrayOfNotify[i].textTemplate);
        resultObj['advanced']['interval'].push(arrayOfNotify[i]?.advanced?.interval);
        resultObj['advanced']['from'].push(arrayOfNotify[i]?.advanced?.from);
        resultObj['advanced']['to'].push(arrayOfNotify[i]?.advanced?.to);
        resultObj['advanced']['daysOfWeek'].push(arrayOfNotify[i]?.advanced?.daysOfWeek);
    }
    return resultObj;
}
