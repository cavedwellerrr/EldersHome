import express from "express";
import Prescription from "../models/prescription_model.js";
import { protectStaff } from "../middleware/staffAuth.js";

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
export default router;