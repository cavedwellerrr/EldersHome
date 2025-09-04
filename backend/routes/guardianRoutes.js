import express from "express";
import {
  registerGuardian,
  loginGuardian,
  logoutGuardian,
  getProfile,
  updateProfile,
  submitElderRequest
} from "../controllers/guardianController.js";

// import {protect} from "../middleware/authGuardianMiddleware.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerGuardian);
router.post("/login", loginGuardian);
router.post("/logout", logoutGuardian);
router.get("/profile", protect, getProfile);
router.put("/updateProfile", protect, updateProfile);



export default router;
