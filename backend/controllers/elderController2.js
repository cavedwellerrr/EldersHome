import Elder, { ElderStatus } from "../models/elder_model.js";
import Payment, { PaymentStatus } from "../models/payment_model.js";
import nodemailer from "nodemailer";

// Guardian creates elder registration request
export const createElderRequest = async (req, res) => {
  try {
    console.log("Request User:", req.user); // Debug: Log req.user
    const { fullName, dob, medicalNotes } = req.body;
    const medicalNotesFile = req.file ? `uploads/${req.file.filename}` : null;
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }
    const elder = await Elder.create({
      fullName,
      dob,
      medicalNotes,
      medicalNotesFile,
      guardian: req.user._id,
      status: "DISABLED_PENDING_REVIEW",
    });
    res.status(201).json({ message: "Elder request created", elder });
  } catch (error) {
    console.error("Error in createElderRequest:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Operator lists pending elder requests
export const listPendingReview = async (req, res) => {
  try {
    const elders = await Elder.find({
      status: "DISABLED_PENDING_REVIEW",
    })
      .populate({
        path: "guardian",
        select: "name email", // or 'fullName email' if User model uses fullName
      })
      .select(
        "fullName dob medicalNotes medicalNotesFile guardian createdAt status"
      );
    res.json(elders);
  } catch (error) {
    console.error("Error in listPendingReview:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Operator lists elders with pending payments
export const listPendingPayments = async (req, res) => {
  try {
    const elders = await Elder.find({
      status: { $in: ["APPROVED_AWAITING_PAYMENT", "PAYMENT_SUCCESS"] },
    })
      .populate("guardian", "name email") // or 'fullName email'
      .populate("paymentId")
      .select(
        "fullName dob medicalNotes medicalNotesFile guardian createdAt status paymentId"
      );
    res.json(elders);
  } catch (error) {
    console.error("Error in listPendingPayments:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Operator approves request → payment required
export const reviewApprove = async (req, res) => {
  try {
    const elder = await Elder.findById(req.params.id);
    if (!elder) return res.status(404).json({ message: "Elder not found" });

    elder.status = ElderStatus.APPROVED_AWAITING_PAYMENT;
    if (req.user?._id) {
      elder.operator = req.user._id;
    }
    await elder.save();

    const payment = await Payment.create({
      elder: elder._id,
      guardian: elder.guardian,
      amount: 5000,
      status: PaymentStatus.PENDING,
      mockCheckoutUrl: `https://mockpay.local/checkout/${elder._id}`,
    });

    elder.paymentId = payment._id;
    await elder.save();

    res.json({ message: "Elder approved, awaiting payment", elder, payment });
  } catch (error) {
    console.error("Error in reviewApprove:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Operator rejects request
export const reviewReject = async (req, res) => {
  try {
    const { reason } = req.body;
    const elder = await Elder.findById(req.params.id);
    if (!elder) return res.status(404).json({ message: "Elder not found" });

    elder.status = ElderStatus.REJECTED;
    elder.rejectionReason = reason;
    if (req.user?._id) {
      elder.operator = req.user._id;
    }
    await elder.save();

    res.json({ message: "Elder rejected", elder });
  } catch (error) {
    console.error("Error in reviewReject:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Guardian marks payment as success
export const markPaymentSuccess = async (req, res) => {
  try {
    const { paymentId } = req.body;
    const payment = await Payment.findById(paymentId).populate("elder");

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    payment.status = PaymentStatus.SUCCESS;
    await payment.save();

    payment.elder.status = ElderStatus.PAYMENT_SUCCESS;
    await payment.elder.save();

    res.json({ message: "Payment successful", payment });
  } catch (error) {
    console.error("Error in markPaymentSuccess:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Operator activates elder after payment
export const activateElder = async (req, res) => {
  try {
    const elder = await Elder.findById(req.params.id);
    if (!elder) return res.status(404).json({ message: "Elder not found" });

    if (elder.status !== ElderStatus.PAYMENT_SUCCESS) {
      return res.status(400).json({ message: "Payment not completed" });
    }

    elder.status = ElderStatus.ACTIVE;
    elder.isDisabled = false;
    if (req.user?._id) {
      elder.operator = req.user._id;
    }
    await elder.save();

    res.json({ message: "Elder activated", elder });
  } catch (error) {
    console.error("Error in activateElder:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Operator sends payment reminder email to guardian
export const sendPaymentReminder = async (req, res) => {
  try {
    const elder = await Elder.findById(req.params.id)
      .populate("guardian")
      .populate("paymentId");

    if (!elder) return res.status(404).json({ message: "Elder not found" });

    if (elder.status !== ElderStatus.APPROVED_AWAITING_PAYMENT) {
      return res.status(400).json({ message: "Elder not awaiting payment" });
    }

    if (!elder.guardian?.email) {
      return res.status(400).json({ message: "Guardian email not found" });
    }

    if (!elder.paymentId || elder.paymentId.status !== PaymentStatus.PENDING) {
      return res.status(400).json({ message: "No pending payment found" });
    }

    elder.paymentId.reminderSentAt = new Date();
    await elder.paymentId.save();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"Your App Support" <${process.env.GMAIL_USER}>`,
      to: elder.guardian.email,
      subject: `Payment Reminder for Elder: ${elder.fullName}`,
      text: `Dear Guardian,\n\nThis is a reminder to complete the payment for ${elder.fullName}.\nAmount: ${elder.paymentId.amount}\nPay here: ${elder.paymentId.mockCheckoutUrl}\n\nThank you!`,
      html: `<p>Dear Guardian,</p><p>This is a reminder to complete the payment for <strong>${elder.fullName}</strong>.</p><p>Amount: ${elder.paymentId.amount}</p><p><a href="${elder.paymentId.mockCheckoutUrl}">Pay Now</a></p><p>Thank you!</p>`,
    });

    console.log("Email sent: %s", info.messageId);
    res.json({ message: "Payment reminder sent", info });
  } catch (error) {
    console.error("Email error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

//list guardian wise elders
export const listMyElders = async (req, res) => {
  try {
    const elders = await Elder.find({ guardian: req.user._id }).select(
      "fullName dob status medicalNotes medicalNotesFile createdAt rejectionReason"
    );
    res.json(elders);
  } catch (error) {
    console.error("Error fetching my elders:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export default {
  createElderRequest,
  listPendingReview,
  listPendingPayments,
  reviewApprove,
  reviewReject,
  markPaymentSuccess,
  activateElder,
  sendPaymentReminder,
};
