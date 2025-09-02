import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    guardian: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guardian",
      required: true,
    },
    elder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Elder",
      required: true,
    },

    amount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },

    transactionId: { type: String }, // Stripe/PayPal transaction reference
    paymentMethod: {
      type: String,
      enum: ["stripe", "paypal", "bank", "cash"],
      default: "stripe",
    },

    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Operator" },
    paymentDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
