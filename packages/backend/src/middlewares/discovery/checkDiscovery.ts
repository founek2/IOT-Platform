import { DeviceModel } from "common/lib/models/deviceModel";
import express from "express";
import mongoose from "mongoose";
import { DiscoveryModel } from "common/lib/models/deviceDiscoveryModel";

export default function (options: { paramKey: string } = { paramKey: "id" }) {
	return async ({ params, user }: any, res: any, next: express.NextFunction) => {
		const discoveryId = params[options.paramKey];
		if (!mongoose.Types.ObjectId.isValid(discoveryId)) return res.status(208).send({ error: "InvalidParam" });

		if (!(await DiscoveryModel.checkExists(discoveryId))) return res.status(404).send({ error: "InvalidDeviceId" });

		if (user.admin) return next();

		if (user.realm && (await DiscoveryModel.checkPermissions(discoveryId, user.realm))) return next();

		res.status(403).send({ error: "invalidPermissions" });
	};
}
