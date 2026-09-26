import { INTERNAL_PROPERTY_STATE_ID, INTERNAL_THING_ID } from "../constants/index.js";
import type { IDevice } from "../models/interface/device.js";
import type { IThing } from "../models/interface/thing.js";
import { ComponentType, PropertyDataType } from "../models/interface/thing.js"

export function getThing(device: IDevice, nodeId: IThing["config"]["nodeId"]): IThing {
	if (nodeId === INTERNAL_THING_ID) {
		return {
			config: {
				name: device.info.name,
				nodeId,
				componentType: ComponentType.generic,
				properties: [
					{
						propertyId: INTERNAL_PROPERTY_STATE_ID,
						name: 'Stav',
						dataType: PropertyDataType.string,
						settable: false,
					}
				]
			}
		}
	}

	return device.things.find((thing) => thing.config.nodeId === nodeId)!;
}
