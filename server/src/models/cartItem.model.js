import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    quantity: { type: Number, default: 1, min: 1 },
    salePrice: { type: Number, default: null },
    bargainId: { type: String, default: null, index: true },
  },
  { timestamps: true }
);

cartItemSchema.index(
  { customerId: 1, productId: 1, salePrice: 1, bargainId: 1 },
  { unique: true },
);

export default mongoose.model("CartItem", cartItemSchema);
