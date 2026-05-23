import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, unique: true, sparse: true },
    categoryId: { type: String, default: null, index: true },
    name: { type: String, required: true },
    fixedPrice: { type: Number, default: 0 },
    minPrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    imageUrl: { type: String, default: "" },
    cloudinaryPublicId: { type: String, default: "" },
    description: { type: String, default: "" },
    status: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
