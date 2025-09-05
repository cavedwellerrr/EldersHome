import express from "express";
import {
  createConsultation,
  getConsultationsByCaretaker,
  updateConsultationStatus,
} from "../controllers/consultation_controller.js";

const router = express.Router();

router.post("/", createConsultation); // caretaker books
router.get("/:caretakerId", getConsultationsByCaretaker); // list caretaker's
router.patch("/:id", updateConsultationStatus); // doctor updates

export default router;
