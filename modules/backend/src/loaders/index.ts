import { logger } from 'common/logger';
import mongoLoader from './mongodb.js';
import subscribers from './subscribers.js';
import { init as initAgenda } from '../agenda.js'; // Agenda init
import { Config } from '../config.js';
import { Context } from '../types/index.js';

/* Load appropriate loaders */
export default async ({ config, context }: { config: Config, context: Context }) => {
    const mongoConnection = await mongoLoader(config);
    if (!mongoConnection) throw Error('Unable to connect to Mongo DB');

    const agenda = await initAgenda(config, context.mailerService)
    subscribers(agenda, context.userService);

    logger.info('Loaders Intialized');
};
