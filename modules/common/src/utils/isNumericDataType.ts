import { PropertyDataType } from "../models/interface/thing.js";

export function isNumericDataType(dataType: PropertyDataType) {
	return dataType === PropertyDataType.integer || dataType === PropertyDataType.float;
}
