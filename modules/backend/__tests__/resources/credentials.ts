import { ComponentType, PropertyDataType } from "common/models/interface/thing";
import { IUser } from "common/models/interface/userInterface";

export const credentials = {
    user: {
        userName: 'test',
        password: '1234',
        email: 'test123@example.cz',
    },
    admin: {
        userName: 'admin',
        password: '123456',
        email: 'admin123@example.cz',
    },
    root: {
        userName: 'root',
        password: '123456123',
        email: 'root123@example.cz',
    },
    deviceId: "507f1f77bcf86cd799439011",
    device: (user: IUser) => ({
        _id: "507f1f77bcf86cd799439011",
        info: {
            name: "Name",
            location: {
                building: "building",
                room: "room"
            }
        },
        permissions: {
            read: [user._id],
            write: [user._id],
            control: [user._id],
        },
        things: [
            {
                config: {
                    name: "name",
                    nodeId: "thingId",
                    componentType: ComponentType.generic,
                    properties: [
                        {
                            propertyId: "id",
                            name: "property",
                            dataType: PropertyDataType.binary,
                            settable: false,
                        }
                    ]
                }
            }
        ],
        metadata: {
            realm: user.info.userName,
            deviceId: "DEV-XXXX",
        }
    }),
    discoveryId: "507f191e810c19729de860ea",
    discoveryDevice: (user: IUser) => ({
        _id: "507f191e810c19729de860ea",
        deviceId: "DEV-YYYY",
        realm: user.realm,
        nodeIds: ["nodeId"],
        things: {
            nodeId: {
                config: {
                    name: "name",
                    nodeId: "nodeId",
                    componentType: ComponentType.switch,
                    propertyIds: ["propertyId"],
                    properties: {
                        propertyId: {
                            propertyId: "propertyId",
                            name: "property",
                            dataType: PropertyDataType.binary,
                            settable: false,
                        }
                    }
                }
            }
        }
    })
};
