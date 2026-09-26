import { DeviceStatus } from 'common/models/interface/device';

export enum CircleColors {
    Grey = 'grey',
    Orange = 'orange',
    Green = 'green',
    Red = 'red',
}

export function getCircleTooltipText(inTransition: boolean, status: DeviceStatus) {
    if (!status || status === DeviceStatus.disconnected || status === DeviceStatus.lost) return 'Odpojeno';
    else if (inTransition) return 'Čeká na potvrzení';
    else if (status === DeviceStatus.alert) return 'Zařízení vyžaduje pozornost';
    else if (status === DeviceStatus.ready) return 'Aktivní';
    else if (status === DeviceStatus.sleeping) return 'Uspané';
    else if (status === DeviceStatus.restarting) return 'Restartování';
    else if (status === DeviceStatus.init) return 'Probíhá inicializace';

    return 'Chybový stav';
}

export default function getCircleColor(inTransition: boolean, status: DeviceStatus): CircleColors {
    if (
        !status ||
        status === DeviceStatus.disconnected ||
        status === DeviceStatus.lost ||
        status === DeviceStatus.restarting ||
        status === DeviceStatus.sleeping
    )
        return CircleColors.Grey;

    if (status === DeviceStatus.alert || status === DeviceStatus.init) return CircleColors.Orange;

    if (status === DeviceStatus.ready) return CircleColors.Green;

    return CircleColors.Red;
}
