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
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    assignedOperator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Operator",
    },
    notifications: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("ElderRequest", elderRequestSchema);
