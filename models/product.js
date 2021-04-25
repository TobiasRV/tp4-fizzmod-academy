import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type:String,
        required: true
    },
    price: {
        type:Number,
        required: true
    },
    description: {
        type:String,
        required: true
    },
    photo: {
        type: String,
        required: true
    }
});

const product = mongoose.model('product', productSchema);

export default {
    product
}
