import express from "express";
import { protectAdmin } from "../middleware/authMiddleware.js";
import {
  registerStaff,
  loginStaff,
  deleteStaff,
  updateStaff,
} from "../controllers/staffController.js";
import Staff from "../models/staff_model.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", protect, registerStaff);
router.post("/login", loginStaff);
router.delete("/:id", protect, deleteStaff);
router.put("/:id", protect, updateStaff);
router.get("/", protect, async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: "Error fetching staff", error: err });
  }
});

export default router;
