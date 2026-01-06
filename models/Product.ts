import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  productName: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
  category?: string;
  extras: string[];
  variations: { size: string; deliveryPrice: number; collectionPrice?: number }[];
  dietaryInfo: { is18Plus: boolean; isSpicy: boolean; isVegan: boolean; isVegetarian: boolean };
  optionGroups: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
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
  },
  { timestamps: true }
);

// Index for faster sorting and searches
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ category: 1 });

export default mongoose.model<IProduct>('Product', ProductSchema);
