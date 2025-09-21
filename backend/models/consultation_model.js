
import mongoose from "mongoose";


const consultationSchema = new mongoose.Schema(
  {
    elder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Elder",
      required: true,
    },
    caretaker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker", 
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor", 
    },
    reason: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["Normal", "Urgent"],
      default: "Normal",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"], 
      default: "Pending",
    },
    requestDate: {
    type: Date,
    default: Date.now, 
  },
    responseNotes: {
      type: String,
      default: "", 
    },
  },
  { timestamps: true } 
);


export default mongoose.model("Consultation", consultationSchema);
