import mongoose from "mongoose";

const bargainDetailSchema = new mongoose.Schema(
  {
    round: { type: Number, required: true },
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
    time: { type: Date, default: Date.now },
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "countered", "accepted", "rejected"],
      default: "pending"
    }
  },
  { _id: false }
);

const bargainSchema = new mongoose.Schema(
  {
    bargainId: { type: String, required: true, unique: true, sparse: true },
    customerId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    quantity: { type: Number, default: 1 },
    details: { type: [bargainDetailSchema], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("Bargain", bargainSchema);
