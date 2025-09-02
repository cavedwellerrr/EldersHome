import mongoose from "mongoose";

const elderRequestSchema = new mongoose.Schema(
  {
    guardian: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guardian",
      required: true,
    },
    elderDetails: {
      name: { type: String, required: true },
      age: { type: Number, required: true },
      gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: true,
      },
      medicalHistory: { type: String },
      specialNeeds: { type: String },
    },
    status: {
      type: String,
      enum: ["pending", "pending_payment", "rejected", "paid", "active"],
      default: "pending",
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    rejectionReason: { type: String },
    assignedOperator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Operator",
    },
    notifications: [
      {
        message: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("ElderRequest", elderRequestSchema);
