import express from "express";
import { protect } from "../middleware/authGuardianMiddleware.js";
import { protectStaff, requireOperator } from "../middleware/staffAuth.js";
import {
  createElderRequest,
  listPendingReview,
  reviewApprove,
  reviewReject,
  markPaymentSuccess,
  activateElder,
} from "../controllers/elderController2.js";

const router = express.Router();

// Guardian creates elder request
router.post("/", protect, createElderRequest);

// Operator review flow
router.get("/pending", protectStaff, requireOperator, listPendingReview);
router.patch("/:id/approve", protectStaff, requireOperator, reviewApprove);
router.patch("/:id/reject", protectStaff, requireOperator, reviewReject);

// Guardian payment confirmation
router.post("/payment/success", protect, markPaymentSuccess);

// Operator activates elder
router.patch("/:id/activate", protectStaff, requireOperator, activateElder);

export default router;
