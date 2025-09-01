import express from "express";
import {
  registerGuardian,
  loginGuardian,
  logoutGuardian,
  getProfile
} from "../controllers/guardianController.js";

import {protect} from "../middleware/authGuardianMiddleware.js";

const router = express.Router();

router.post("/register", registerGuardian);
router.post("/login", loginGuardian);
router.post("/logout", logoutGuardian);
router.get("/profile", protect, getProfile);

export default router;
