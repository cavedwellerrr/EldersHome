import express from "express";
import {
  approveElderRequest,
  rejectElderRequest,
  assignElderDetails,
  createElderRequest,
} from "../controllers/ElderRequestController.js";
import { protectOperator } from "../middleware/authOperatorMiddleware.js";
import { protect } from "../middleware/authGuardianMiddleware.js";

const router = express.Router();

router.post("/create", protect, createElderRequest);

// Operator approves a request and creates elder account
router.put("/approve/:id", protectOperator, approveElderRequest);

// Operator rejects a request
router.put("/reject/:id", protectOperator, rejectElderRequest);

// Operator assigns room & caretaker after payment
router.put("/assign/:id", protectOperator, assignElderDetails);

export default router;
