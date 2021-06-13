import mongoose from 'mongoose';

export function connectMongoose(dbUri: string) {
    return mongoose.connect(dbUri, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    });
}
