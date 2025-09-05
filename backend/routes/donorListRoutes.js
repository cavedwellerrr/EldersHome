import express from "express";
import { getAllDonors, deleteDonor } from "../controllers/donorListController.js";

const router = express.Router();

router.get("/", getAllDonors);
router.delete("/:id", deleteDonor);

export default router;
