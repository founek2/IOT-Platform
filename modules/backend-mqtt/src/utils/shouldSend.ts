import { is } from 'ramda';
import { NOTIFY_INTERVALS } from 'common/constants';
import { INotifyThingProperty } from 'common/models/interface/notifyInterface';

function getMinFromEpoch(date: Date) {
    return date.getTime() / 1000 / 60;
}

function getMinDiff(d1: Date, d2: Date) {
    return getMinFromEpoch(d1) - getMinFromEpoch(d2);
}

/**
 *
 * @param {String|Date} time in format: "HH:MM" or Date instance
 */
function timeToNumeric(time: Date | string) {
    if (typeof time === 'string') {
        const [hours, mins] = time.split(':');
        return Number(hours) * 60 + Number(mins);
    }
    if (is(Date, time)) {
        const [hours, mins] = [time.getHours(), time.getMinutes()];
        return Number(hours) * 60 + Number(mins);
    }

    throw Error('Invalid type - only supported String|Date');
}

// check if is in time range (compare hours and minutes)
function isInRange(now: Date | string, from: Date | string, to: Date | string) {
    const nowNumeric = timeToNumeric(now);
    const fromNumeric = from ? timeToNumeric(from) : 0;
    const toNumberic = to ? timeToNumeric(to) : Number.MAX_SAFE_INTEGER;
    return nowNumeric > fromNumeric && nowNumeric < toNumberic;
}

export default function shouldSend({ interval, from, to, daysOfWeek }: INotifyThingProperty['advanced'], tmp: any) {
    const now = new Date();
    const enabled = daysOfWeek.includes(now.getDay()) && isInRange(now, from, to);

    if (enabled && interval === NOTIFY_INTERVALS.JUST_ONCE) {
        // just once
        if (!tmp?.lastSatisfied) return true;
    } else if (enabled && interval === NOTIFY_INTERVALS.ALWAYS) return true;
    //always
    else if (enabled && (!tmp?.lastSendAt || getMinDiff(now, tmp.lastSendAt) > interval)) return true; //in interval

    return false;
}
