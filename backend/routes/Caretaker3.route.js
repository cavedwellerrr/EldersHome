import express from "express";
import {
  getAllCaretakers,
  getCaretakerById,
  getAssignedElders,
  assignEldersToCaretaker,
} from "../controllers/CaretakerController3.js";

const router = express.Router();

// GET all caretakers
router.get("/", getAllCaretakers);

// GET caretaker by ID
router.get("/:caretakerId", getCaretakerById);

// GET assigned elders of caretaker
router.get("/:caretakerId/elders", getAssignedElders);

// POST assign elders to caretaker
router.post("/:caretakerId/elders", assignEldersToCaretaker);

export default router;
