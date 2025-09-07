import express from "express";
import EventEnrollment from "../models/eventEnrollment.model.js";
import { protectAdmin } from "../middleware/authMiddleware.js";
import { protectStaff } from "../middleware/staffAuth.js";

const router = express.Router();

// POST: Enroll elder into event
router.post("/", protectStaff, async (req, res) => {
  try {
    const { eventId, elderId } = req.body;

    if (!eventId || !elderId) {
      return res.status(400).json({ message: "Event ID and Elder ID are required" });
    }

    // Check if already enrolled
    const existing = await EventEnrollment.findOne({ event: eventId, elder: elderId });
    if (existing) {
      return res.status(400).json({ message: "Elder already enrolled in this event" });
    }

    const enrollment = await EventEnrollment.create({
      event: eventId,
      elder: elderId,
      caretaker: req.staff._id,
    });

    res.status(201).json({ message: "Enrollment successful", data: enrollment });
  } catch (err) {
    console.error("Error creating enrollment:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET: Get all enrollments (Admin only)
router.get("/", protectStaff, async (req, res) => {
  try {
    const { eventId } = req.query;
    const query = eventId ? { event: eventId } : {};

    const enrollments = await EventEnrollment.find(query)
      .populate("elder", "fullName age")
      .populate("caretaker", "name")
      .populate("event", "title");

    res.status(200).json({ count: enrollments.length, data: enrollments });
  } catch (err) {
    console.error("Error fetching enrollments:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// DELETE: Remove an enrollment (Admin only)
router.delete("/:id", protectStaff, async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await EventEnrollment.findById(id);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    await EventEnrollment.findByIdAndDelete(id);

    res.status(200).json({ message: "Enrollment deleted successfully" });
  } catch (err) {
    console.error("Error deleting enrollment:", err);
    res.status(500).json({ message: "Server Error" });
  }
});
export default router;