import mongoose, { Schema } from 'mongoose';
const DealSchema = new Schema({
    dealName: { type: String, required: true },
    productIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    price: { type: Number, default: 0 },
}, { timestamps: true });
export default mongoose.model('Deal', DealSchema);
