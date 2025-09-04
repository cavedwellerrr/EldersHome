import express from "express";
import mongoose from "mongoose";
import Request from "../models/Request.js";
import Elder from "../models/Elder.js";
import Guardian from "../models/Guardian.js";
import upload from "../middleware/upload.js";
import sendEmail from "../utils/sendEmail.js";
import { protect, restrictTo } from "../middleware/auth.js"; // Assume auth middleware

const router = express.Router();

// Submit elder request (Guardian)
router.post(
  "/submit-elder-request",
  protect,
  restrictTo("guardian"),
  upload.array("medicalFiles", 5), // Allow up to 5 files
  async (req, res) => {
    try {
      const { elderName, dob, gender, medicalNotes } = req.body;
      const guardian = req.user._id; // From auth middleware

      const medicalFiles = req.files.map((file) => ({
        url: file.path,
        fileName: file.filename,
      }));

      const request = new Request({
        elderName,
        dob,
        gender,
        medicalNotes,
        medicalFiles,
        guardian,
      });

      await request.save();

      res.status(201).json({ message: "Request submitted successfully", request });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Get all pending requests (Operator)
router.get(
  "/pending",
  protect,
  restrictTo("operator"),
  async (req, res) => {
    try {
      const requests = await Request.find({ status: "pending" })
        .populate("guardian", "name email")
        .select("elderName dob gender medicalNotes medicalFiles guardian status createdAt");

      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update request status (Operator)
router.put(
  "/:id/status",
  protect,
  restrictTo("operator"),
  async (req, res) => {
    try {
      const { status } = req.body; // "approved" or "rejected"
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const request = await Request.findById(req.params.id).populate(
        "guardian",
        "email name"
      );
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      request.status = status;
      await request.save();

      // If approved, create Elder document
      if (status === "approved") {
        const elder = new Elder({
          name: request.elderName,
          dob: request.dob,
          gender: request.gender,
          guardian: request.guardian,
          request: request._id,
          isActive: false, // Will be active after payment
        });
        await elder.save();
      }

      // Send email to guardian
      const subject = `Elder Request ${status.charAt(0).toUpperCase() + status.slice(1)}`;
      const text = `Dear ${request.guardian.name},\n\nYour request for ${request.elderName} has been ${status}.\n\nThank you,\nCare Team`;
      await sendEmail(request.guardian.email, subject, text);

      res.json({ message: `Request ${status} successfully`, request });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get guardian's requests (Guardian)
router.get(
  "/my-requests",
  protect,
  restrictTo("guardian"),
  async (req, res) => {
    try {
      const requests = await Request.find({ guardian: req.user._id }).select(
        "elderName dob gender medicalNotes medicalFiles status createdAt"
      );
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;