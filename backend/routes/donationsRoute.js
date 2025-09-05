import express from "express";
import { createDonation, getAllDonations, updateDonationStatus, deleteDonation} from "../controllers/donationController.js";
import Stripe from "stripe";
import Donation from "../models/donations.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.post("/", createDonation);
router.get("/", getAllDonations);
router.post("/delete/:id", deleteDonation);
router.put("/:id", updateDonationStatus);



export default router;
