// models/eventEnrollment.model.js
import mongoose from "mongoose";

const eventEnrollmentSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    elder: { type: mongoose.Schema.Types.ObjectId, ref: "Elder", required: true },
    caretaker: { type: mongoose.Schema.Types.ObjectId, ref: "Caretaker", required: true },
    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const EventEnrollment = mongoose.model("EventEnrollment", eventEnrollmentSchema);
export default EventEnrollment;
