import Agenda from 'agenda';
import { Config } from './config.js';
import { AGENDA_JOB_TYPE } from 'common/constants/agenda';
import { logger } from 'common';
import { MailerService } from './services/mailerService.js';


export async function init(config: Config, mailerService: MailerService) {
    const configAgenda = config.agenda;
    const connectionOpts = {
        db: {
            address: config.dbUri,
            collection: configAgenda.collection,
            options: {
                useUnifiedTopology: true,
            },
        },
    };

    const agenda = new Agenda(connectionOpts);

    const jobTypes = configAgenda.jobs ? configAgenda.jobs.split(',') : [];
    logger.debug('loading jobs:', jobTypes);

    await Promise.all(jobTypes.map(async (type: string) => {
        const { default: job } = await import(`./jobs/${type}.js`);
        job(agenda, mailerService);
    }));

    agenda.processEvery('one minute');

    agenda.on('start', (job) => {
        logger.debug('Job', job.attrs.name, 'starting');
    });
    if (jobTypes.length) {
        (async () => {
            await agenda.start();

            agenda.every('24 hours', AGENDA_JOB_TYPE.REMOVE_OLD_JOBS);
        })();
    }

    return agenda
}


