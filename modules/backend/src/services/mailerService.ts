import { logger } from 'common/logger';
import Email from 'email-templates';
import { createTransport } from 'nodemailer';
import path from 'node:path';
import { Config } from '../config.js';
import { IToken } from 'common/models/tokenModel';
import { fileURLToPath } from 'node:url';

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));

/**
 * Service for sending emails
 */
export class MailerService {
    defaultEmail: Email | undefined
    homepage: string = ""

    constructor(config?: Config) {
        const emailConf = config?.email;
        if (!emailConf?.host) return;

        const transporter = createTransport({
            host: emailConf.host,
            port: emailConf.port,
            secure: emailConf.secure,
            auth: {
                user: emailConf.userName,
                pass: emailConf.password,
            },
        });

        // transporter.verify((err, status) => {
        //     console.log("email verify:", err, status)
        // })
        this.defaultEmail = new Email({
            message: {
                from: emailConf.userName,
            },
            transport: transporter,
            send: process.env.NODE_ENV_TEST !== 'true',
            preview: false,
        });

        if (config?.homepage) this.homepage = config.homepage
    };

    sendSignUp = async (user: { info: { email: string } }) => {
        if (!this.defaultEmail) return false;

        const result = await this.defaultEmail.send({
            template: path.join(moduleDirectory, '../templates/emails/registration'),
            message: {
                to: user.info.email,
            },
            locals: {
                url: this.homepage,
                email: user.info.email,
                homepage: this.homepage,
            },
        });
    };

    sendLogin = async ({ email }: { email: string }) => {
        if (!this.defaultEmail) return false;

        await this.defaultEmail.send({
            template: path.join(moduleDirectory, '../templates/emails/login'),
            message: {
                to: email,
            },
            locals: {
                data: 'test',
            },
        });
    };

    sendForgotPassword = async (token: IToken['data'], user: { info: { email: string } }) => {
        if (!this.defaultEmail) return false;

        await this.defaultEmail
            .send({
                template: path.join(moduleDirectory, '../templates/emails/password_reset'),
                message: {
                    to: user.info.email,
                    // attachments: [
                    //     {
                    //         filename: 'email_banner.png',
                    //         path: path.join(moduleDirectory, '../templates/emails/password_reset/email_banner.png'),
                    //         cid: 'banner',
                    //     },
                    // ],
                },
                locals: {
                    url: this.homepage,
                    token: token,
                    email: user.info.email,
                },
            })
            .catch(logger.error);
        logger.debug('sending forgot password email');
    };
}
