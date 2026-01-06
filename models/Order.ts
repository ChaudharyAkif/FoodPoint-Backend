import mongoose, { Schema, Document } from 'mongoose';

/* =========================
   Order Interface
========================= */
export interface IOrder extends Document {
  orderId: string;
  items: {
    productId?: mongoose.Types.ObjectId;
    dealId?: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  address?: string;
  paymentMethod: 'cash' | 'card' | 'online';
  status: 'pending' | 'completed' | 'cancelled';
  placedBy?: string;
  role?: 'cashier' | 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

/* =========================
   Order Schema
========================= */
const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product'
        },
        dealId: {
          type: Schema.Types.ObjectId,
          ref: 'Deal'
        },
        name: {
          type: String,
          required: true,
          trim: true
        },
        price: {
          type: Number,
          required: true,
          min: 0
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1
        }
      }
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    address: {
      type: String,
      default: 'N/A'
    },

    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online'],
      default: 'cash'
    },

    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
      index: true
    },

    placedBy: {
      type: String,
      default: 'Guest'
    },

    role: {
      type: String,
      enum: ['cashier', 'user', 'admin'],
      default: 'user'
    }
  },
  {
    timestamps: true
  }
);

/* =========================
   Indexes
========================= */
OrderSchema.index({ status: 1, createdAt: -1 });

/* =========================
   Pre-save Validation
========================= */
OrderSchema.pre('save', async function () {
  const hasValidItems = this.items.some(
    item => item.productId || item.dealId
  );

  if (!hasValidItems) {
    throw new Error('Each order item must have either productId or dealId');
  }
});

/* =========================
   Model Export
========================= */
const Order = mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
