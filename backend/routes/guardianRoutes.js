import express from "express";
import {
  registerGuardian,
  loginGuardian,
  logoutGuardian,
  getProfile,
  updateProfile,
} from "../controllers/guardianController.js";

import {
  createElderRequest,
  getMyElderRequests,
} from "../controllers/ElderRequestController.js";

import { protect } from "../middleware/authGuardianMiddleware.js";

const router = express.Router();

router.post("/register", registerGuardian);
router.post("/login", loginGuardian);
router.post("/logout", logoutGuardian);
router.get("/profile", protect, getProfile);
router.put("/updateProfile", protect, updateProfile);

router.post("/elder-request", createElderRequest);
router.get("/my-requests", getMyElderRequests);

export default router;
