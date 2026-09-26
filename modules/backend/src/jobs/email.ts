import Agenda from 'agenda';
import { logger } from 'common/logger';
import { MailerService } from '../services/mailerService.js';
import { AGENDA_JOB_TYPE } from 'common/constants/agenda';
import { UserBasic } from '../types/index.js';
import { IToken } from 'common/models/tokenModel';

export default function (agenda: Agenda, mailerService: MailerService) {
    /* Send SignUp email */
    agenda.define(AGENDA_JOB_TYPE.SIGN_UP_EMAIL, async (job: Agenda.Job<{ user: UserBasic }>) => {
        logger.info('Runnning sign up email JOB', job.attrs.data);
        return mailerService.sendSignUp(job.attrs.data.user);
    });

    /* Schedule failed SignUp email */
    agenda.on(`fail:${AGENDA_JOB_TYPE.SIGN_UP_EMAIL}`, (err, job) => {
        // TODO check which error happend -> than do stuff based on it
        logger.error(`Job failed with error: ${err.message}`);
        job.attrs.nextRunAt = new Date(Date.now() + 120 * 60 * 1000);
        job.save();
    });

    /* Send email with link to change password to user account */
    agenda.define(
        AGENDA_JOB_TYPE.FORGOT_PASSWORD_EMAIL,
        async (job: Agenda.Job<{ user: UserBasic; token: IToken }>) => {
            logger.info('Runnning forgot password email JOB', job.attrs.data.token);
            return mailerService.sendForgotPassword(job.attrs.data.token.data, job.attrs.data.user);
        }
    );
}
