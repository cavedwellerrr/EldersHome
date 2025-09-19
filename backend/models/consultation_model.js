// Import mongoose
import mongoose from "mongoose";

// Consultation Schema
const consultationSchema = new mongoose.Schema(
  {
    elder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Elder", // link to elder
      required: true,
    },
    caretaker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker", // caretaker requesting
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor", // doctor who responds
    },
    reason: {
      type: String,
      required: true, // caretaker must give reason
    },
    priority: {
      type: String,
      enum: ["Normal", "Urgent"], // only two levels
      default: "Normal",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"], // workflow
      default: "Pending",
    },
    requestDate: {
    type: Date,
    default: Date.now, //  Auto-set when request is created
  },
    responseNotes: {
      type: String,
      default: "", // doctor notes when responding
    },
  },
  { timestamps: true } // createdAt, updatedAt
);

// Export model
export default mongoose.model("Consultation", consultationSchema);
