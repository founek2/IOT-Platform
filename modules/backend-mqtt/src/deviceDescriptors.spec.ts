import { checkValidFormData } from 'common/utils/validation';
import deviceDescriptors from './deviceDescriptors.js';
import { ComponentType, PropertyClass, PropertyDataType } from 'common/models/interface/thing';

export const DEVICE = {
    info: {
        name: 'Udírna',
        location: {
            building: 'doma',
            room: 'pokoj',
        },
    },
    things: [
        {
            config: {
                name: 'Senzor',
                nodeId: 'sensor0',
                componentType: ComponentType.activator,
                properties: [
                    {
                        propertyId: 'temperature',
                        name: 'Teplota',
                        propertyClass: PropertyClass.temperature,
                        unitOfMeasurement: '*C',
                        dataType: PropertyDataType.float,
                    },
                ],
            },
        },
    ],
    metadata: {
        realm: 'user1',
        deviceId: 'ESP-1192',
    },
};

describe('device validation', () => {
    test('should validate device', () => {
        const result = checkValidFormData({ DEVICE }, deviceDescriptors, false);
        console.log(result);
        // TODO still not working
        // expect(result).toMatchObject({ valid: true });
    });
});
