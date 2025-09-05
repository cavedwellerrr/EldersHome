import mongoose from "mongoose";

export const ElderStatus = {
  DISABLED_PENDING_REVIEW: "DISABLED_PENDING_REVIEW",
  APPROVED_AWAITING_PAYMENT: "APPROVED_AWAITING_PAYMENT",
  PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
  ACTIVE: "ACTIVE",
  REJECTED: "REJECTED",
};

const elderSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other",
    },
    medicalNotes: { type: String, default: "" },
    pdfPath: { type: String, default: null },
    guardian: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guardian",
      required: true,
    },
    operator: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },

    caretaker: { type: mongoose.Schema.Types.ObjectId, ref: "Caretaker" },

    status: {
      type: String,
      enum: Object.values(ElderStatus),
      default: ElderStatus.DISABLED_PENDING_REVIEW,
    },
    rejectionReason: { type: String, default: "" },
    isDisabled: { type: Boolean, default: true },

    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  },
  { timestamps: true }
);

export default mongoose.model("Elder", elderSchema);
