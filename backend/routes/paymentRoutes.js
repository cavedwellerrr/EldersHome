import express from "express";
import {
  createPaymentSession,
  updatePaymentStatus,
} from "../controllers/PaymentController.js";

import { protect } from "../middleware/authGuardianMiddleware.js";

const router = express.Router();

// Guardian creates a mock payment session for an approved request
router.post("/checkout/:requestId", protect, createPaymentSession);

// Update payment status (simulate payment success/failure)
router.put("/status/:requestId", updatePaymentStatus);

export default router;
