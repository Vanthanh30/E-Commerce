import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, sparse: true, trim: true },
    password: { type: String, required: true },
    fullName: { type: String, default: "" },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin"
    },
    status: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
