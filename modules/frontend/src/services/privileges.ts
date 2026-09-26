import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import CloudIcon from '@mui/icons-material/Cloud';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import PeopleIcon from '@mui/icons-material/People';
import { AllowedRoutes, PrivilegesContainer, Route, RouteMenu } from 'common/privileges';
import { lazy } from 'react';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import { allowedGroups } from 'common/constants/privileges';
import { LocationsLoader } from '../Pages/Locations.loader';
import { RoomLoader } from '../Pages/Room.loader';

const UserManagement = lazy(() => import(/* webpackChunkName: 'UserManagement' */ '../Pages/UserManagement'));

const DeviceManagementLazy = lazy(
    () => import(/* webpackChunkName: 'DeviceManagement' */ '../Pages/DeviceManagementRoom')
);

const LocationsLazy = lazy(() => import(/* webpackChunkName: 'Locations' */ '../Pages/Locations'));

const LocationsManagementLazy = lazy(
    () => import(/* webpackChunkName: 'LocationsManagement' */ '../Pages/LocationsManagement')
);

const RoomLazy = lazy(() => import(/* webpackChunkName: 'Room' */ '../Pages/Room'));

// const EditNotifyFormLazy = lazy(() => import(/* webpackChunkName: 'EditNotifyForm' */ '../Pages/EditNotifyForm'));

const ProfileLazy = lazy(() => import(/* webpackChunkName: 'Profile' */ '../Pages/Profile'));
const EditNotifyFormLazy = lazy(() => import(/* webpackChunkName: 'NotifyForm' */ '../Pages/EditNotifyForm'));
const DashboardLazy = lazy(() => import(/* webpackChunkName: 'Dashboard' */ '../Pages/Dashboard'));
const UserDashboardLazy = lazy(() => import(/* webpackChunkName: 'UserDashboard' */ '../Pages/UserDashboard'));

const userRoutes: Route[] = [
    {
        path: '/building/:building/room/:room',
        name: 'devices',
        Component: RoomLazy,
        Loader: RoomLoader,
    },
    {
        path: '/building/:building',
        name: 'devices',
        Component: LocationsLazy,
        Loader: LocationsLoader
    },
    {
        path: '/building',
        Component: LocationsLazy,
        Loader: LocationsLoader,
        name: 'devices',
        Icon: CloudIcon,
    },
    {
        path: '/userDashboard',
        Component: UserDashboardLazy,
        // Loader: LocationsLoader,
        name: 'userDashboard',
        Icon: CloudIcon,
    },
    {
        path: '/profile/*',
        Component: ProfileLazy,
    },
    { path: '/management/building', Component: LocationsManagementLazy, name: 'deviceControl', Icon: DevicesOtherIcon },
    // { path: '/management/building/:building', Component: LocationsManagementLazy, name: 'deviceControl' },
    // { path: '/management/building/:building/room/:room', Component: DeviceManagementLazy, name: 'deviceControl' },
    { path: '/device/:deviceId/thing/:nodeId/notification', Component: EditNotifyFormLazy },
];
const adminRoutes: Route[] = [
    ...userRoutes,
    { path: '/userManagement', Component: UserManagement, name: 'userManagement', Icon: PeopleIcon },
    { path: '/dashboard', Component: DashboardLazy, name: 'dashboard', Icon: EqualizerIcon }
]

export const routes: AllowedRoutes = {
    user: {
        routes: userRoutes,
    },
    admin: {
        routes: adminRoutes,
    },
    root: {
        routes: adminRoutes,
    },
    flow: {
        routes: [{ path: 'https://flow.iotdomu.cz', name: 'visualProgramming', Icon: AllInclusiveIcon }],
    },
};

export const privileges = new PrivilegesContainer(routes, allowedGroups);
