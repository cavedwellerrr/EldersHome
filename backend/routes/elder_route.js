import express from "express";

import {
  getAllElders,
  getEldersByCaretaker,
  getElderByName,
} from "../controllers/elderController.js";

const router = express.Router();

// Doctor/Admin: get all elders
router.get("/elders", getAllElders);

// Caretaker: get elders assigned to them
router.get("/elders/caretakers/:caretakerId/", getEldersByCaretaker);

// Search elders by name
router.get("/elders/search/by-name", getElderByName);

export default router;
