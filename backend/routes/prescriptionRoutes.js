import express from "express";
import Prescription from "../models/prescription_model.js";
import { protectStaff } from "../middleware/staffAuth.js";
import Doctor from "../models/doctor_model.js";
const router = express.Router();

// Add new prescription
router.post("/", async (req, res) => {
  try {
    const prescription = new Prescription(req.body);
    await prescription.save();

    const populated = await Prescription.findById(prescription._id)
      .populate("elder", "fullName")
      .populate({
        path: "doctor",
        populate: { path: "staff", select: "name email" },
      })
       .populate("caretaker", "name email");

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});



// Get prescriptions for an elder (optional)
router.get("/elder/:elderId", async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ elder: req.params.elderId })
      .populate("doctor", "specialization")
      .populate("elder", "fullName");
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//  Get prescriptions for logged-in caretaker
router.get("/caretaker/my", protectStaff, async (req, res) => {
  try {
    if (req.staff.role !== "caretaker") {
      return res.status(403).json({ message: "Only caretakers can view prescriptions" });
    }

    const prescriptions = await Prescription.find({ caretaker: req.staff._id })
      .populate("elder", "fullName dob")
      .populate({
        path: "doctor",
        populate: { path: "staff", select: "name email" },
      })
      .sort({ createdAt: -1 }); // latest first

    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// DELETE prescription by ID
router.delete("/:id", protectStaff, async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndDelete(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }
    res.json({ message: "Prescription deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Get prescriptions for logged-in doctor
router.get("/doctor/my", protectStaff, async (req, res) => {
  try {
    if (req.staff.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can view prescriptions" });
    }

    // find doctor profile linked to staff
    const doctor = await Doctor.findOne({ staff: req.staff._id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    // now fetch prescriptions by doctor._id
    const prescriptions = await Prescription.find({ doctor: doctor._id })
      .populate("elder", "fullName dob")
      .populate({
        path: "doctor",
        populate: { path: "staff", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (err) {
    console.error("Error fetching doctor prescriptions:", err);
    res.status(500).json({ message: err.message });
  }
});



export default router;