import express from "express";
import { protect } from "../middleware/authGuardianMiddleware.js";
import { protectStaff, requireOperator } from "../middleware/staffAuth.js";
import {
  createElderRequest,
  listPendingReview,
  listPendingPayments,
  reviewApprove,
  reviewReject,
  markPaymentSuccess,
  activateElder,
  sendPaymentReminder,
} from "../controllers/elderController2.js";

const router = express.Router();

// Guardian creates elder request
router.post("/", protect, createElderRequest);

// Operator review flow
router.get("/pending", protectStaff, requireOperator, listPendingReview);
router.get(
  "/pending-payments",
  protectStaff,
  requireOperator,
  listPendingPayments
);
router.patch("/:id/approve", protectStaff, requireOperator, reviewApprove);
router.patch("/:id/reject", protectStaff, requireOperator, reviewReject);
router.patch(
  "/:id/send-reminder",
  protectStaff,
  requireOperator,
  sendPaymentReminder
); // New route
// Guardian payment confirmation
router.post("/payment/success", protect, markPaymentSuccess);

// Operator activates elder
router.patch("/:id/activate", protectStaff, requireOperator, activateElder);

export default router;
