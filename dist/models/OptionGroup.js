import mongoose, { Schema } from 'mongoose';
const OptionGroupSchema = new Schema({
    name: { type: String, required: true },
    isRequired: { type: Boolean, default: false },
    options: [{ type: Schema.Types.ObjectId, ref: 'Option' }],
    linkedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });
export default mongoose.model('OptionGroup', OptionGroupSchema);
