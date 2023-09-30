import resource from 'common/lib/middlewares/resource-router-middleware';
import tokenAuthMIddleware from 'common/lib/middlewares/tokenAuth';
import { DeviceModel } from 'common/lib/models/deviceModel';
import { RequestWithAuth } from 'common/lib/types';
import { getProperty } from 'common/lib/utils/getProperty';
import { getThing } from 'common/lib/utils/getThing';
import { validateValue } from 'common/lib/utils/validateValue';
import { Actions } from '../../services/actionsService';
import checkRealmControlPerm from 'common/lib/middlewares/device/checkRealmControlPerm';

type Params = { realm: string; deviceId: string; nodeId: string };
type Request = RequestWithAuth<Params>;
type RequestQuery = RequestWithAuth<Params, { property?: string; value?: string }>;

/**
 * URL prefix /device/:deviceId/thing/:nodeId
 */
export default () =>
    resource({
        mergeParams: true,
        middlewares: {
            modify: [tokenAuthMIddleware(), checkRealmControlPerm({ paramKey: 'deviceId' })],
        },

        async index(req: Request, res) {
            res.send('Z bezpečnostích důvodů není metoda GET podporována. Použijte matodu POST.');
        },

        async create({ params, query }: RequestQuery, res) {
            const { realm, deviceId, nodeId } = params;

            const doc = await DeviceModel.findByRealm(realm, deviceId);
            if (!doc) return res.sendStatus(404);

            const thing = getThing(doc, nodeId);

            const propertyId = query.property;
            const value = query.value;

            if (!propertyId || !value) return res.sendStatus(400);

            const property = getProperty(thing, propertyId);
            const result = validateValue(property, Buffer.from(value));
            if (!result.valid) return res.sendStatus(400);

            (await Actions.deviceSetProperty(deviceId, nodeId, propertyId, value, doc))
                ? res.sendStatus(204)
                : res.sendStatus(400);
        },
    });
