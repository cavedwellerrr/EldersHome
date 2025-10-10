// routes/consultationRoutes.js
import express from "express";
import { protectStaff } from "../middleware/staffAuth.js";
import {
  requestConsultation,
  updateConsultation,
  getMyConsultations,
  deleteConsultation,
  rejectConsultation,
} from "../controllers/consultationController.js";
import Consultation from "../models/consultation_model.js";
import Doctor from "../models/doctor_model.js";

const router = express.Router();

// Caretaker creates consultation
router.post("/", protectStaff, requestConsultation);

// Doctor views only their pending consultations
router.get("/pending", protectStaff, async (req, res) => {
  try {
    // Find doctor document for logged-in staff
    const doctor = await Doctor.findOne({ staff: req.staff._id });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Get pending consultations for this doctor
    const consultations = await Consultation.find({
      doctor: doctor._id,
      status: "Pending",
    })
  .populate("elder")
  .populate({
    path: "caretaker",
    populate: { path: "staff", select: "name" },
  })
  .populate({
    path: "doctor",
    populate: { path: "staff", select: "name" },
  });

    res.json(consultations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// Doctor approves/rejects a consultation
router.patch("/:id", protectStaff, updateConsultation);

// Caretaker sees their consultations
router.get("/my", protectStaff, getMyConsultations);

// Delete consultation
router.delete("/:id", protectStaff, deleteConsultation);

// Reject consultation
router.put("/:id/reject", protectStaff, rejectConsultation);

export default router;
