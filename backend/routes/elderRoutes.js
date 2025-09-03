import express from "express";
import { protect } from "../middleware/authGuardianMiddleware.js";
import {
  createElderRequest,
  listPendingReview,
  listPendingPayments,
  reviewApprove,
  reviewReject,
  markPaymentSuccess,
  activateElder,
  sendPaymentReminder,
} from "../controllers/elderController2.js";
import multer from "multer";

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".pdf");
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const router = express.Router();

// Guardian routes
router.post(
  "/",
  protect,
  upload.single("medicalNotesFile"),
  createElderRequest
);

// Operator routes
router.get("/pending", listPendingReview);
router.get("/pending-payments", listPendingPayments);
router.patch("/:id/approve", reviewApprove);
router.patch("/:id/reject", reviewReject);
router.post("/payment-success", markPaymentSuccess);
router.patch("/:id/activate", activateElder);
router.post("/:id/remind", sendPaymentReminder);

export default router;
