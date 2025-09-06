// routes/consultationRoutes.js
import express from "express";
import {
  requestConsultation,
  listPendingConsultations,
  updateConsultation,
  getMyConsultations,
} from "../controllers/consultationController.js";

const router = express.Router();

// Caretaker creates consultation
router.post("/", requestConsultation);

// Doctor views all pending consultations
router.get("/pending", listPendingConsultations);

// Doctor approves/rejects
router.patch("/:id", updateConsultation);
router.get("/my",getMyConsultations);




export default router;
