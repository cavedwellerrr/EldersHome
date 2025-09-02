import Elder, { ElderStatus } from "../models/elder_model.js";
import Payment, { PaymentStatus } from "../models/payment_model.js";

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

// Operator approves request → payment required
export const reviewApprove = async (req, res) => {
  try {
    const elder = await Elder.findById(req.params.id);
    if (!elder) return res.status(404).json({ message: "Elder not found" });

    elder.status = ElderStatus.APPROVED_AWAITING_PAYMENT;
    elder.operator = req.user._id;
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
    elder.operator = req.user._id;
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
    await elder.save();

    res.json({ message: "Elder activated", elder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
