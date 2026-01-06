import mongoose, { Schema, Document } from 'mongoose';

export interface IDeal extends Document {
  dealName: string;
  productIds: mongoose.Types.ObjectId[];
  status: 'active' | 'inactive';
  price: number;
}

const DealSchema: Schema = new Schema(
  {
    dealName: { type: String, required: true },
    productIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    price: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IDeal>('Deal', DealSchema);