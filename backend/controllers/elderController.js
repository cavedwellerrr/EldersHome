// eldercontroller.js

import Elder, { ElderStatus } from "../models/elder_model.js";
import Payment, { PaymentStatus } from "../models/payment_model.js";

// Guardian creates elder registration request
export const createElderRequest = async (req, res) => {
    try {
        console.log("req.body:", req.body);
        console.log("req.file:", req.file);

        if (!req.body) {
            return res.status(400).json({ message: "No form data received" });
        }

        const { fullName, dob, gender, address, medicalNotes } = req.body;
        const guardianId = req.guardian._id; // From protect middleware

        if (!fullName || !dob || !gender || !address || !medicalNotes) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        const elder = new Elder({
            fullName,
            dob,
            gender,
            address,
            medicalNotes,
            pdfPath: req.file ? req.file.path : null,
            guardian: guardianId,
            status: ElderStatus.DISABLED_PENDING_REVIEW,
        });

        await elder.save();
        res.status(201).json({ message: "Elder registration request submitted successfully" });
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
            // ✅ fixed template string
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

// Operator "sends" payment reminder (email disabled) — only records timestamp
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

        // Just mark that a reminder was (logically) sent
        elder.paymentId.reminderSentAt = new Date();
        await elder.paymentId.save();

        res.json({
            message: "Reminder marked as sent (email disabled)",
            payment: {
                _id: elder.paymentId._id,
                amount: elder.paymentId.amount,
                status: elder.paymentId.status,
                mockCheckoutUrl: elder.paymentId.mockCheckoutUrl,
                reminderSentAt: elder.paymentId.reminderSentAt,
            },
        });
    } catch (error) {
        console.error("sendPaymentReminder error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get all active elders
export const listActiveElders = async (req, res) => {
    try {
        // NOTE: If you intended truly active elders, consider ElderStatus.ACTIVE.
        const elders = await Elder.find({
            status: ElderStatus.APPROVED_AWAITING_PAYMENT, // <- change to ElderStatus.ACTIVE if needed
        })
            .populate("guardian")
            .populate("caretaker");
        res.json(elders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// List elders by guardian
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
