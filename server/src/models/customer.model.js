import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true, unique: true, sparse: true, trim: true },
    fullName: { type: String, default: "" },
    address: { type: String, default: "" },
    birthDate: { type: Date, default: null },
    username: { type: String, required: true, unique: true, sparse: true, trim: true },
    password: { type: String, required: true },
    email: { type: String, default: "" },
    accountStatus: { type: Number, default: 1 },
    privateKey: { type: String, default: "" },
    publicKey: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
