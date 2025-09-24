import express from "express";
import { protect } from "../middleware/authGuardianMiddleware.js";
import { protectStaff } from "../middleware/staffAuth.js";

import {
  createElderRequest,
  listPendingReview,
  listPendingPayments,
  reviewApprove,
  reviewReject,
  activateElder,
  sendPaymentReminder,
  markPaymentSuccess,
  listActiveElders,
  listEldersByGuardian,
  deleteElder,
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
  (req, res, next) => {
    upload.single("pdf")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res
          .status(400)
          .json({ message: `Multer error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  createElderRequest
);

// In your elder routes file
router.delete("/:id", protect, deleteElder);

// Operator routes
router.get("/pending", protectStaff, listPendingReview);
router.get("/pending-payments", protectStaff, listPendingPayments);
router.patch("/:id/approve", reviewApprove);
router.patch("/:id/reject", reviewReject);
router.post("/payment-success", markPaymentSuccess);
router.patch("/:id/activate", activateElder);
router.patch("/:id/send-reminder", protectStaff, sendPaymentReminder);
router.get("/active", protectStaff, listActiveElders);

router.get("/guardian/:guardianId", protect, listEldersByGuardian);

export default router;
