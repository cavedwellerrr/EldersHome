import Elder, { ElderStatus } from "../models/elder_model.js";
import Payment, { PaymentStatus } from "../models/payment_model.js";
import nodemailer from "nodemailer";

// Guardian creates elder registration request
export const createElderRequest = async (req, res) => {
  try {
    // Log req.body and req.file for debugging
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    // Check if req.body exists
    if (!req.body) {
      return res.status(400).json({ message: "No form data received" });
    }

    const { fullName, dob, gender, address, medicalNotes } = req.body;
    const guardianId = req.guardian._id; // From protect middleware

    // Validate required fields
    if (!fullName || !dob || !gender || !address || !medicalNotes) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    const elder = new Elder({
      fullName,
      dob,
      gender,
      address,
      medicalNotes,
      pdfPath: req.file ? req.file.path : null, // Store PDF path if uploaded
      guardian: guardianId,
      status: ElderStatus.DISABLED_PENDING_REVIEW, // Updated to match schema
    });

    await elder.save();
    res
      .status(201)
      .json({ message: "Elder registration request submitted successfully" });
  } catch (error) {
    console.error("Error in createElderRequest:", error);
    res.status(400).json({ message: error.message });
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
        select: "amount status mockCheckoutUrl reminderSentAt",
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

    res.json({ message: "Elder approved" });
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
    console.error("Email error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all active elders
export const listActiveElders = async (req, res) => {
  try {
    const elders = await Elder.find({
      status: ElderStatus.APPROVED_AWAITING_PAYMENT,
    })
      .populate("guardian")
      .populate("caretaker");
    res.json(elders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//list elder by guardian
export const listEldersByGuardian = async (req, res) => {
  try {
    const { guardianId } = req.params;
    if (!req.guardian || req.guardian._id.toString() !== guardianId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    const elders = await Elder.find({ guardian: guardianId })
      .populate("guardian", "name email phone")
      .populate({
        path: "caretaker",
        populate: {
          path: "staff",
          select: "name email phone",
        },
      });
    res.json(elders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete elder
export const deleteElder = async (req, res) => {
  try {
    const elder = await Elder.findById(req.params.id);

    if (!elder) {
      return res.status(404).json({ message: "Elder not found" });
    }

    // Check if the requesting guardian owns this elder
    if (elder.guardian.toString() !== req.guardian._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this elder" });
    }

    await Elder.findByIdAndDelete(req.params.id);

    res.json({ message: "Elder deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
