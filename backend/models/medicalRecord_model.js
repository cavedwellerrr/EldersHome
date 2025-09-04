import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    elderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Elder",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    recordType: {
      type: String,
      required: true,
      enum: ["Diagnosis", "Lab Report", "X-Ray", "Other Note"],
    },
    notes: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("MedicalRecord", medicalRecordSchema);
