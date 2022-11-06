import { createContext, useContext } from 'react';
import { Thing } from '../store/slices/application/thingsSlice';

export const ThingContext = createContext<Thing>({} as Thing);

export function useThing() {
    return useContext(ThingContext);
}
