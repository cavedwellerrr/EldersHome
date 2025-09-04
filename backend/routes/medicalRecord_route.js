import express from "express";
import {
  addMedicalRecord,
  getAllMedicalRecords,
  updateMedicalRecord,
  deleteMedicalRecord,
} from "../controllers/medicalRecordController.js";


const router = express.Router();

//  Add
router.post("/elders/:elderId/medicalrecords", addMedicalRecord);

//  Get all
router.get("/medicalrecords", getAllMedicalRecords);

// Update
router.patch("/medicalrecords/:id", updateMedicalRecord);

// Delete
router.delete("/medicalrecords/:id", deleteMedicalRecord);

export default router;
