import mongoose from 'mongoose';

const connect = async (url: string) => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(url);
    }
};

const truncate = async () => {
    if (mongoose.connection.readyState !== 0) {
        const { collections } = mongoose.connection;

        const promises = Object.keys(collections).map((collection) =>
            mongoose.connection.collection(collection).deleteMany({})
        );

        await Promise.all(promises);
    }
};

const disconnect = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
};

export default {
    connect,
    truncate,
    disconnect,
};
