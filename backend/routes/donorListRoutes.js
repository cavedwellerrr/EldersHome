import express from "express";
import { getAllDonors } from "../controllers/donorListController.js";

const router = express.Router();

router.get("/", getAllDonors);

export default router;
