import { mergeDeepRight, prop, uniqBy } from 'ramda';
import React from 'react';
import { UiMessageKey } from '../localization/uiMessages.js';

export interface AllowedGroup {
    text: string;
    name: string;
}

export interface AllowedGroups {
    [groupName: string]: { allowedGroups: AllowedGroup[] };
}
type LazyComponent = React.LazyExoticComponent<({ title }: { title?: string }) => JSX.Element>;
export interface Route {
    path: string;
    Component?: LazyComponent;
    Loader?: () => JSX.Element;
    name?: UiMessageKey;
    Icon?: any;
}

export type RouteWithComponent = Route & Required<Pick<Route, "Component">>

export interface RouteMenu {
    path: string;
    name: UiMessageKey;
    Icon: any;
}

export interface AllowedRoutes {
    [groupName: string]: { routes: Route[] };
}

export interface Privileges {
    [groupName: string]: { routes: Route[]; allowedGroups: AllowedGroup[] };
}

export class PrivilegesContainer {
    privileges: Privileges;
    constructor(routes: AllowedRoutes, allowedGroups: AllowedGroups) {
        this.privileges = mergeDeepRight(routes, allowedGroups);
    }
    getMenuPaths = (groups: string[]): RouteMenu[] => {
        const allowedRoutes = groups
            .map((group) => this.privileges[group].routes)
            .flat()
            .filter((r) => r.name && r.Icon);

        return uniqBy(prop('path'), allowedRoutes) as RouteMenu[];
    };

    getPathsWithComp = (groups: string[]): RouteWithComponent[] => {
        const allowedRoutes = groups
            .map((group) => this.privileges[group].routes)
            .flat()
            .filter((r) => Boolean(r.Component));
        return uniqBy(prop('path'), allowedRoutes) as RouteWithComponent[];
    };

    getAllowedGroups = (groups: string[]) => {
        const allowedGroups = groups.map((group) => this.privileges[group].allowedGroups).flat();

        return uniqBy(prop('name'), allowedGroups);
    };
}
