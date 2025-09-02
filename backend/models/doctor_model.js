import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
      unique: true, // Each doctor must have one staff account
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },

    appointments: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
