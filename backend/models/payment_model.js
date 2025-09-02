import mongoose from "mongoose";

export const PaymentStatus = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
};

const paymentSchema = new mongoose.Schema(
  {
    elder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Elder",
      required: true,
    },
    guardian: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guardian",
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "LKR" },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    mockCheckoutUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
