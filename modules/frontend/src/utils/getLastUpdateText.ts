import { logger } from 'common/logger';

/**
 * Calculate diff between now and provided time -> translate to human readable form
 * In form: "Last update before 10 hours"
 * @param {Date} time
 * @returns {Array} [text "updated before:", timeout to next change]
 */
export default function getLastUpdateText(
    time: Date,
    prefix = 'Poslední aktualizace před',
    nowText = 'Aktuální'
): [string, number | null] {
    if (String(time) === 'Invalid Date') {
        logger.error('invalid date', time);
        return ['', 10]; // 10s default, otherwise performance issues
    }

    const now = new Date();
    const diff = new Date(now.getTime() - time.getTime());
    const diffSec = Math.round(diff.getTime() / 1000);
    const min = Math.floor(diffSec / 60);
    const hours = Math.floor(min / 60);
    const days = Math.floor(hours / 24);
    const diffMonths = monthDiff(now, time)

    if (diff.getTime() <= 0 || diffSec < 60) return [nowText, 60 - diffSec];

    if (hours >= 1 && hours < 24) {
        return [prefix + ' ' + hours + ' hod', (hours + 1) * 60 * 60 - diffSec];
    } else if (days >= 1 && days < 30) {
        return [prefix + ' ' + days + ' dny', (days + 1) * 24 * 60 * 60 - diffSec];
    } else if (diffMonths >= 12) {
        return [prefix + ' ' + Math.round(diffMonths / 12) + ' rok', null];
    } else if (diffMonths > 0) {
        return [prefix + ' ' + diffMonths + ' měsíc', null];
    } else {
        return [prefix + ' ' + min + ' min', (min + 1) * 60 - diffSec];
    }
}

function monthDiff(d1: Date, d2: Date) {
    if (d1 > d2) {
        [d1, d2] = [d2, d1]
    }
    let months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}