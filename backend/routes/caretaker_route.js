import express from "express";
import { protectStaff, requireOperator } from "../middleware/staffAuth.js";
import { assignCaretaker } from "../controllers/caretakerController.js";

const router = express.Router();

router.post("/assign", protectStaff, requireOperator, assignCaretaker);

export default router;