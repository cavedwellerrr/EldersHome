import mongoose from "mongoose";

const elderSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    dob: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    room: { type: String }, // assigned by operator
    caretaker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker",
    },
    guardian: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guardian",
    },
    isActive: { type: Boolean, default: false }, // active after payment and assignment
  },
  { timestamps: true }
);

export default mongoose.model("Elder", elderSchema);
