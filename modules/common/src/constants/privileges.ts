/**
 * Separated for usage in backend
 */

import { append } from 'ramda';
import { IUser } from '../models/interface/userInterface.js';

const adminAllowedGroups = [
    { name: 'user', text: 'uživatel' },
    { name: 'admin', text: 'správce' },
    { name: 'flow', text: 'flow' },
];

export const allowedGroups = {
    user: { allowedGroups: [{ name: 'user', text: 'Uživatel' }] },
    admin: {
        allowedGroups: adminAllowedGroups,
    },
    root: { allowedGroups: append({ name: 'root', text: 'root' }, adminAllowedGroups) },
    flow: { allowedGroups: [] },
};

export function getAllowedGroups(groups: IUser['groups']) {
    let uniq = new Set<string>();
    for (const userGroup of groups) {
        allowedGroups[userGroup].allowedGroups.map((v) => uniq.add(v.name));
    }

    return [...uniq];
}
