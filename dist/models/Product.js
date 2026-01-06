import mongoose, { Schema } from 'mongoose';
const ProductSchema = new Schema({
    productName: { type: String, required: true, index: true },
    price: { type: Number, default: 0, index: true },
    quantity: { type: Number, default: 10 },
    image: { type: String },
    description: { type: String },
    category: { type: String, index: true },
    extras: [{ type: String }],
    variations: [
        {
            size: { type: String },
            deliveryPrice: { type: Number },
            collectionPrice: { type: Number },
        },
    ],
    dietaryInfo: {
        is18Plus: { type: Boolean, default: false },
        isSpicy: { type: Boolean, default: false },
        isVegan: { type: Boolean, default: false },
        isVegetarian: { type: Boolean, default: false },
    },
    optionGroups: [{ type: Schema.Types.ObjectId, ref: 'OptionGroup' }],
}, { timestamps: true });
// Index for faster sorting and searches
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ category: 1 });
export default mongoose.model('Product', ProductSchema);
