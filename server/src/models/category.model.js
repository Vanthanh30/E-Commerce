import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    categoryId: { type: String, required: true, unique: true, sparse: true },
    name: { type: String, required: true },
    description: { type: String, default: null },
    status: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
