import { IDevice, DeviceCommand } from 'common/models/interface/device';
import { IDiscovery } from 'common/models/interface/discovery';
import { IThing, IThingProperty } from 'common/models/interface/thing';
import { BusEmitterType } from 'common/interfaces/asyncEmitter';
import fetch from 'node-fetch';

/**
 * Service to communicate with backend-mqtt, allowing sending data directly to devices
 */
export class Actions {
    bus: BusEmitterType

    constructor(bus: BusEmitterType) {
        this.bus = bus;
    }

    /**
     * send ApiKey to device over MQTT
     * @param {IDiscovery["_id"]} deviceId
     * @param {IDevice["apiKey"]} apiKey
     */
    public async deviceInitPairing(device: IDevice) {
        this.bus.emit("pairing_new_device", device)
        return true;
        // const res = await fetch(this.serviceMqttUri + '/api/actions/device/' + deviceId + '/pairing/init', {
        //     method: 'PUT',
        //     body: JSON.stringify({ apiKey }),
        //     headers: {
        //         Accept: 'application/json',
        //         'Content-Type': 'application/json',
        //     },
        // });
        // return res.status === 204;
    }

    /**
     * Set status of devices`s property (control it) over MQTT
     */
    public async deviceSetProperty(
        nodeId: IThing['config']['nodeId'],
        propertyId: IThingProperty['propertyId'],
        value: string | number | boolean,
        device: IDevice
    ): Promise<boolean> {
        this.bus.emit("device_set_property_value", { device, nodeId, propertyId, value })
        // const res = await fetch(
        //     `${this.serviceMqttUri}/api/actions/device/${deviceId}/thing/${nodeId}/property/${propertyId}`,
        //     {
        //         method: 'PATCH',
        //         body: JSON.stringify({ value, device }),
        //         headers: {
        //             Accept: 'application/json',
        //             'Content-Type': 'application/json',
        //         },
        //     }
        // );
        // return res.status === 204

        return true;
    }

    /**
     * Send command to device over MQTT
     * @param {IDevice} doc
     * @param {DeviceCommand} command
     */
    public async deviceSendCommand(device: IDevice, command: DeviceCommand): Promise<boolean> {
        this.bus.emit("device_send_command", { device, command })

        // const res = await fetch(`${this.serviceMqttUri}/api/actions/device/${doc._id}`, {
        //     method: 'POST',
        //     body: JSON.stringify({ command, device: doc }),
        //     headers: {
        //         Accept: 'application/json',
        //         'Content-Type': 'application/json',
        //     },
        // });
        // return res.status === 204;

        return true;
    }
}
