import mongoose from "mongoose";

const operatorSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
      unique: true,
    },
    assignedRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ElderRequest",
      },
    ],
    processedPayments: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    ],
    notifications: [
      {
        message: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Operator", operatorSchema);
