import { EntityId } from '@reduxjs/toolkit';
import { getPreferencesOrder } from '../selectors/getters.js';

export function byPreferences<T extends { order: number }, U extends { id: string }>(preferences: Record<EntityId, T>) {
    return (a: U, b: U) => getPreferencesOrder(a.id, preferences) - getPreferencesOrder(b.id, preferences);
}
