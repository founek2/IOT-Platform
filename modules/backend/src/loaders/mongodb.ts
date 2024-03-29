import { logger } from 'common/lib/logger';
import mongoose from 'mongoose';
import { connectMongoose } from 'common/lib/utils/connectMongoose';
import { Config } from '../config';

/* Initialize connection to mongoDB */
export default async (config: Config): Promise<mongoose.Connection | null> => {
    try {
        const mong = await connectMongoose(config.dbUri);

        logger.info('Connection to DB has been established successfully.');

        /** Uncomment this for sync DB with models and seed data */
        // await sequelize.sync({ force: true }) && await loadSeeds(sequelize)

        // console.log("All models were synchronized successfully.");
        return mong.connection;
    } catch (error) {
        logger.error('Unable to connect to the database: %s', error);
    }

    return null;
};
