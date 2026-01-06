import mongoose, { Schema, Document } from 'mongoose';

export interface IOptionGroup extends Document {
  name: string;
  isRequired: boolean;
  options: mongoose.Types.ObjectId[];
  // Use mongoose IDs instead of raw strings for sync integrity
  linkedProducts: mongoose.Types.ObjectId[]; 
}

const OptionGroupSchema = new Schema(
  {
    name: { type: String, required: true },
    isRequired: { type: Boolean, default: false },
    options: [{ type: Schema.Types.ObjectId, ref: 'Option' }],
    linkedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
  },
  { timestamps: true }
);

export default mongoose.model<IOptionGroup>('OptionGroup', OptionGroupSchema);