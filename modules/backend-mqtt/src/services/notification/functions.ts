import shouldSend from '../../utils/shouldSend.js';
import { NotifyType } from 'common/models/interface/notifyInterface';

const functions: {
    [key in NotifyType]: (
        value: number | string,
        limit: number | string,
        advanced: any,
        tmp: any
    ) => { ruleSatisfied: boolean; valid: boolean };
} = {
    [NotifyType.below]: function below(value, limit, advanced, tmp) {
        const ruleSatisfied = value < limit;
        return {
            ruleSatisfied,
            valid: ruleSatisfied && shouldSend(advanced, tmp),
        };
    },
    [NotifyType.over]: function over(value, limit, advanced, tmp) {
        const ruleSatisfied = value > limit;
        return {
            ruleSatisfied,
            valid: ruleSatisfied && shouldSend(advanced, tmp),
        };
    },
    [NotifyType.always]: function always(value, limit, advanced, tmp) {
        return {
            ruleSatisfied: true,
            valid: true && shouldSend(advanced, tmp),
        };
    },
    [NotifyType.equal]: function below(value, limit, advanced, tmp) {
        const ruleSatisfied = value === limit;
        return {
            ruleSatisfied,
            valid: ruleSatisfied && shouldSend(advanced, tmp),
        };
    },
};

export default functions;
