import { DeviceModel } from "common/lib/models/deviceModel";
import express from "express";
import checkDevice from "./checkDevice";

export default function (options: { paramKey: string } = { paramKey: "id" }) {
	return async (req: any, res: any, next: express.NextFunction) => {
		checkDevice(options)(req, res, async () => {
			const { params, user = {} } = req;
			const deviceId = params[options.paramKey];

			if (user.admin) return next();

			if (user.id && (await DeviceModel.checkReadPerm(deviceId, user.id))) return next();

			res.status(404).send({ error: "invalidPermissions" });
		});
	};
}
