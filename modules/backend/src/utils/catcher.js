import ErrorModel from 'common/models/error';

export default function (prefix) {
    return function (e) {
        console.log('handling', e);
        console.log(typeof e);
        console.log(e.message);
        console.log('instance: ', e instanceof Error);

        if (e.name === 'MongoError') {
            switch (e.code) {
                case 11000:
                    throw Error(prefix + 'AlreadyExist');
                default:
                    throw Error();
            }
        } else if (e.name === 'ValidationError') {
            const keys = Object.keys(e.errors);
            let messages = '';
            keys.forEach((key) => {
                messages += e.errors[key].message;
            });
            console.log('validationFailed, fields> ' + keys + ' validační zprávy: ' + messages);
            throw Error('ValidationError');
        } else if (typeof e.message === 'string') {
            throw Error(e.message);
        }

        ErrorModel.create(e);
        console.log(e);
        throw Error();
    };
}
