import express from "express";
import {
  getPendingElderRequests,
  approveElderRequest,
  rejectElderRequest,
  processPayment,
  assignElderDetails,
} from "../controllers/operatorController.js";

import { protectOperator } from "../middleware/authOperatorMiddleware.js";

const router = express.Router();

// Operator views all pending elder requests
router.get("/requests/pending", protectOperator, getPendingElderRequests);

// Operator approves a pending request
router.put("/request/:id/approve", protectOperator, approveElderRequest);

// Operator rejects a pending request
router.put("/request/:id/reject", protectOperator, rejectElderRequest);

// Operator processes payment (optional: can also be handled by payment gateway webhook)
router.put("/request/:id/payment", protectOperator, processPayment);

// Operator assigns room and caretaker to approved elder
router.put("/request/:id/assign", protectOperator, assignElderDetails);

export default router;
