// routes/doctorRoutes.js
import express from "express";
import Doctor from "../models/doctor_model.js";
import { protectStaff } from "../middleware/staffAuth.js";

const router = express.Router();

// ✅ Get all doctors (admin/caretaker use)
router.get("/", protectStaff, async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("staff", "name email");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Error fetching doctors", error: err.message });
  }
});

// ✅ Get logged-in doctor profile (for doctor use)
router.get("/my", protectStaff, async (req, res) => {
  if (req.staff.role !== "doctor") {
    return res.status(403).json({ message: "Only doctors allowed" });
  }
  const doctor = await Doctor.findOne({ staff: req.staff._id }).populate("staff", "name email");
  if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
  res.json(doctor);
});

export default router;
