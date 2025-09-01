import mongoose from "mongoose";

const caretakerSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
      unique: true,
    },
    assignedElders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Elder",
      },
    ],
    shift: {
      type: String,
      default: "day",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Caretaker", caretakerSchema);
