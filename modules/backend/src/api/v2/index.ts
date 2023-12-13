import { Router } from 'express';
import { Config } from '../../config';
import thing from './thing';

export default ({ config }: { config: Config }) => {
    let api = Router();
    // mount the user resource
    api.use('/realm/:realm/device/:deviceId/thing/:nodeId', thing());

    // expose some API metadata at the root
    api.get('/', (req, res) => {
        res.json({ version: '2.0.0' });
    });

    return api;
};