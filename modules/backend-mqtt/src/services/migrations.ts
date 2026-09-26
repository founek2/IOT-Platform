import { MigrateModel, IMigrateDocument } from 'common/models/migrateModel';
import { logger } from 'common/logger';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Config } from '../config.js';

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationFolder = path.join(moduleDirectory, '../migrations');

async function loadMigration(
    fileName: string
): Promise<{ up: (config: Config) => Promise<void>; down: (config: Config) => Promise<void> }> {
    return import(pathToFileURL(path.join(migrationFolder, fileName)).href);
}

export async function migrate(config: Config) {
    let migrations = await MigrateModel.findOne();
    if (!migrations) migrations = await MigrateModel.create({});

    const files = await fs.readdir(migrationFolder);

    for (const fileName of files) {
        if (!fileName.endsWith('.js')) continue;

        const migrationNumber = parseInt(fileName.split('_')[0]);
        if (migrations.applied.indexOf(migrationNumber) == -1) {
            logger.info('Running migration', fileName);

            const { up } = await loadMigration(fileName);
            await up(config);
            migrations.applied.push(migrationNumber);
        }
    }

    migrations.applied.sort();
    await migrations.save();
    logger.info('Migration done.');
}
