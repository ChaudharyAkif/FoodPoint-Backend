import mongoose, { Schema } from 'mongoose';
const OptionSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
    // Correctly references the Product model
    linkedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });
export default mongoose.model('Option', OptionSchema);
