import express from "express";
import { createDonation, getAllDonations, updateDonationStatus } from "../controllers/donationController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createDonation);
router.get("/", getAllDonations);

router.put("/:id", updateDonationStatus);

export default router;
