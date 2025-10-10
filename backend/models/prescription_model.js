import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    elder: { type: mongoose.Schema.Types.ObjectId, ref: "Elder", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    caretaker: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
    drugs: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        form: {
          type: String,
          enum: ["Tablet", "Capsule", "Syrup", "Injection", "Cream", "Drops", "Other"],
          required: true,
        },
        duration: { type: String, required: true },
      },
    ],
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);
