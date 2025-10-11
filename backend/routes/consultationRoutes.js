// routes/consultationRoutes.js
import express from "express";
import { protectStaff } from "../middleware/staffAuth.js";
import {
  requestConsultation,
  updateConsultation,
  deleteConsultation,
  rejectConsultation,
} from "../controllers/consultationController.js";

import Consultation from "../models/consultation_model.js";
import Doctor from "../models/doctor_model.js";
import Caretaker from "../models/caretaker_model.js"; //  Add this import

const router = express.Router();

// Caretaker creates consultation
router.post("/", protectStaff, requestConsultation);

// Doctor views only their pending consultations
router.get("/pending", protectStaff, async (req, res) => {
  try {

    
    const doctor = await Doctor.findOne({ staff: req.staff._id });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });


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
    console.error("Error fetching doctor consultations:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Caretaker views only the consultations they requested
router.get("/my", protectStaff, async (req, res) => {
  try {
    const caretaker = await Caretaker.findOne({ staff: req.staff._id });
    if (!caretaker) return res.status(404).json({ message: "Caretaker not found" });

    const consultations = await Consultation.find({
      caretaker: caretaker._id,
    })
      .populate("elder")
      .populate({
        path: "caretaker",
        populate: { path: "staff", select: "name" },
      })
      .populate({
        path: "doctor",
        populate: { path: "staff", select: "name" },
      })
      .sort({ requestDate: -1 });

    res.json(consultations);
  } catch (error) {
    console.error("Error fetching caretaker consultations:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//  Doctor approves/rejects a consultation
router.patch("/:id", protectStaff, updateConsultation);



// Delete consultation
router.delete("/:id", protectStaff, deleteConsultation);

// Reject consultation
router.put("/:id/reject", protectStaff, rejectConsultation);

export default router;