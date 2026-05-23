import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    salePrice: { type: Number, default: 0 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, sparse: true },
    customerId: { type: String, required: true, index: true },
    saleDate: { type: Date, default: Date.now },
    paymentMethod: { type: Number, default: 0 },
    paymentId: { type: String, default: "" },
    status: { type: Number, default: 1 },
    shippingAddress: { type: String, default: "" },
    items: { type: [orderItemSchema], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
