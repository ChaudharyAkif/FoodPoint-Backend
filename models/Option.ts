import mongoose, { Schema, Document } from 'mongoose';

export interface IOption extends Document {
  name: string;
  price: number;
  linkedProducts: mongoose.Types.ObjectId[];
}

const OptionSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  // Correctly references the Product model
  linkedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

export default mongoose.model<IOption>('Option', OptionSchema);