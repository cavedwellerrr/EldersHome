// routes/appointmentRoutes.js
import express from "express";
import Appointment from "../models/appointment_model.js";
import Doctor from "../models/doctor_model.js";
import { protectStaff } from "../middleware/staffAuth.js";

const router = express.Router();

// ✅ Get all appointments for logged-in doctor
router.get("/my", protectStaff, async (req, res) => {
  try {
    if (req.staff.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can view their appointments" });
    }

    // Find doctor profile linked to staff
    const doctor = await Doctor.findOne({ staff: req.staff._id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate("elder", "fullName dob")
      .populate("guardian", "name email")
      .populate("caretaker", "name email");

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Update appointment status (e.g., mark as completed)
router.patch("/:id", protectStaff, async (req, res) => {
  try {
    if (req.staff.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can update appointments" });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = status || appointment.status;
    if (notes) appointment.notes = notes;
    await appointment.save();

    res.json({ message: "Appointment updated successfully", appointment });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: error.message });
  }
});
// ✅ Get all appointments for logged-in caretaker
router.get("/caretaker/my", protectStaff, async (req, res) => {
  try {
    if (req.staff.role !== "caretaker") {
      return res.status(403).json({ message: "Only caretakers can view their appointments" });
    }

    const appointments = await Appointment.find({ caretaker: req.staff._id })
      .populate("elder", "fullName dob")
      .populate({
        path: "doctor",
        populate: { path: "staff", select: "name email" },
      })
      .populate("guardian", "name email");

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching caretaker appointments:", error);
    res.status(500).json({ message: error.message });
  }
});



export default router;
