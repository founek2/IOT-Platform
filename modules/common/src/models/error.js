import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const errorSchema = new Schema(
    {
        type: { type: String },
        exception: { type: Object, required: true },
        created: { type: Date, default: Date.now }
    },
    {
        toObject: {
            transform: function (doc, ret) {
                ret.id = ret._id;
                delete ret.__v;
                delete ret._id;
            }
        }
    }
);
errorSchema.statics.create = function (exception, type = "unknown") {
    const ErrorModel = this.model('Error');
    const user = new ErrorModel({ exception, type });
    return user
        .save()
};

const Errorr = mongoose.model('Error', errorSchema);
export default Errorr;
