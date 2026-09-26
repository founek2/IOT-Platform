import { HistoricalModel } from 'common/models/historyModel';
import { Config } from '../config.js';

export async function up(config: Config) {
    await HistoricalModel.deleteMany({}).exec();
}

export async function down() { }
