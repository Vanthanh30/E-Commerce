import mongoose from "mongoose";

const bargainDetailSchema = new mongoose.Schema(
{
  round: Number,

  customerPrice: Number,

  botPrice: Number,

  customerMessage: String,

  botMessage: String,

  quantity: Number,

  status: {
    type: String,
    enum: [
      "pending",
      "countered",
      "accepted",
      "rejected"
    ]
  },

  autoReplyAt: Date,

  responder: {
    type: String,
    enum: ["admin", "auto", null],
    default: null
  },

  time: {
    type: Date,
    default: Date.now
  },

  responseTime: Date,

  confirmedQuantity: Number,
  orderSessionExpiresAt: Date
},
{ _id: false }
);

const bargainSchema = new mongoose.Schema(
  {
    bargainId: { type: String, required: true, unique: true, sparse: true },
    customerId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    quantity: { type: Number, default: 1 },
    confirmedQuantity: { type: Number, default: null },
    orderSessionExpiresAt: { type: Date, default: null },
    addedToCart: { type: Boolean, default: false },

      //Bargain status
    status: {
      type: String,
      enum: ["negotiating", "accepted", "rejected", "expired"],
      default: "negotiating"
    },

    expiredAt: {
      type: Date,
      required: true
    },

    details: { type: [bargainDetailSchema], default: [] },

  },
  { timestamps: true }
);

export default mongoose.model("Bargain", bargainSchema);
