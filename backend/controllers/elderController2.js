import Elder, { ElderStatus } from "../models/elder_model.js";
import Payment, { PaymentStatus } from "../models/payment_model.js";
import nodemailer from "nodemailer";

// Guardian creates elder registration request
export const createElderRequest = async (req, res) => {
  try {
    const { fullName, dob, medicalNotes } = req.body;

    const elder = await Elder.create({
      fullName,
      dob,
      medicalNotes,
      guardian: req.user?._id || req.guardian?._id,
    });

    res.status(201).json({ message: "Elder request submitted", elder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Operator lists pending elder requests
export const listPendingReview = async (req, res) => {
  try {
    const elders = await Elder.find({
      status: ElderStatus.DISABLED_PENDING_REVIEW,
    }).populate("guardian");
    res.json(elders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Operator lists elders with pending payments
export const listPendingPayments = async (req, res) => {
  try {
    const elders = await Elder.find({
      status: ElderStatus.APPROVED_AWAITING_PAYMENT,
    })
      .populate({
        path: "guardian",
        select: "fullName name email phoneNumber",
      })
      .populate({
        path: "paymentId",
        match: { status: PaymentStatus.PENDING },
        select: "amount status mockCheckoutUrl reminderSentAt", // Include reminderSentAt
      });
    // Filter out elders where paymentId is null (no matching pending payment)
    const filteredElders = elders.filter((elder) => elder.paymentId !== null);
    res.json(filteredElders);
  } catch (error) {
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

    // Update reminderSentAt
    elder.paymentId.reminderSentAt = new Date();
    await elder.paymentId.save();

    // Configure transporter for Gmail
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.GMAIL_USER, // e.g., your-email@gmail.com
        pass: process.env.GMAIL_APP_PASSWORD, // App Password from Google
      },
    });

    const info = await transporter.sendMail({
      from: `"Your App Support" <${process.env.GMAIL_USER}>`, // Use GMAIL_USER from .env
      to: elder.guardian.email,
      subject: `Payment Reminder for Elder: ${elder.fullName}`,
      text: `Dear Guardian,\n\nThis is a reminder to complete the payment for ${elder.fullName}.\nAmount: ${elder.paymentId.amount}\nPay here: ${elder.paymentId.mockCheckoutUrl}\n\nThank you!`,
      html: `<p>Dear Guardian,</p><p>This is a reminder to complete the payment for <strong>${elder.fullName}</strong>.</p><p>Amount: ${elder.paymentId.amount}</p><p><a href="${elder.paymentId.mockCheckoutUrl}">Pay Now</a></p><p>Thank you!</p>`,
    });

    console.log("Email sent: %s", info.messageId);

    res.json({ message: "Payment reminder sent", info });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ message: error.message });
  }
};
