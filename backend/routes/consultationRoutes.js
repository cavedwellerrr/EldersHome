// routes/consultationRoutes.js
import express from "express";
import {
  requestConsultation,
  listPendingConsultations,
  updateConsultation,
  getMyConsultations,
  getDoctorConsultations,
  deleteConsultation,
  rejectConsultation,
} from "../controllers/consultationController.js";

const router = express.Router();

// Caretaker creates consultation
router.post("/", requestConsultation);

// Doctor views all pending consultations
router.get("/pending", listPendingConsultations);

// Doctor approves/rejects
router.patch("/:id", updateConsultation);
router.get("/my",getMyConsultations);


// Doctor sees only his consultations
router.get("/doctor/my",  getDoctorConsultations);

// routes/consultationRoutes.js
router.delete("/:id", deleteConsultation);
// routes/consultationRoutes.js
router.put("/:id/reject",  rejectConsultation);



export default router;
