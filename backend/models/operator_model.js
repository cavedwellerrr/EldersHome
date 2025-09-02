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
      {
        elder: { type: mongoose.Schema.Types.ObjectId, ref: "Elder" },
        status: {
          type: String,
          enum: ["pending", "success", "failed"],
          default: "pending",
        },
        paymentDate: { type: Date },
        amount: { type: Number },
        processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Operator" }, // optional
      },
    ],
    notifications: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Operator", operatorSchema);
