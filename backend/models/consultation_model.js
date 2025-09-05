import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
  {
    elderName: { type: String, required: true }, // caretaker types elder name
    caretakerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker",
      required: true,
    },
    specialty: { type: String, required: true },
    priority: { type: String, enum: ["Normal", "Urgent"], default: "Normal" },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Consultation", consultationSchema);
