import express from "express";
import {
  createElderRequest,
  approveElderRequest,
  rejectElderRequest,
  activateElder,
} from "../controllers/ElderRequestController.js";

import { protectOperator } from "../middleware/authOperatorMiddleware.js";
import { protect } from "../middleware/authGuardianMiddleware.js";

const router = express.Router();

// Guardian creates a new elder request
router.post("/create", protect, createElderRequest);

// Operator approves a request
router.put("/approve/:requestId", protectOperator, approveElderRequest);

// Operator rejects a request
router.put("/reject/:requestId", protectOperator, rejectElderRequest);

// Operator activates elder after payment
router.put("/activate/:requestId", protectOperator, activateElder);

export default router;
