import { logger } from 'common';

// TODO create own Error class to differ from other crashes
export default function (res) {
    return function ({ message }) {
        if (message) {
            logger.error(message);
            res.status(208).send({ error: message });
        } else {
            res.sendStatus(500);
        }
    };
}
