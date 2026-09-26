import { DeviceModel } from 'common/models/deviceModel';
import { Config } from '../config.js';

export async function up(config: Config) {
    await DeviceModel.updateMany(
        {},
        {
            $unset: { 'things.$[].state': 1 },
        }
    ).exec();
}

export async function down() { }
