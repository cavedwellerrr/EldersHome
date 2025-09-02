import mongoose from "mongoose";

const ElderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    assignedCaretaker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
    },
    email: { type: String, required: true }, // optional if you need to send emails
    phone: { type: String }, // optional
    paymentStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Elder = mongoose.model("Elder", ElderSchema);

export default Elder;
