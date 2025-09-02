import ElderRequest from "../models/elderRequest_model.js";

// Optional mock database for demo
const mockPayments = [];

// Create a mock payment session for an elder request
export const createPaymentSession = async (req, res) => {
  try {
    const { requestId } = req.params;

    const elderRequest = await ElderRequest.findById(requestId).populate(
      "guardian"
    );
    if (!elderRequest)
      return res.status(404).json({ message: "Request not found" });

    if (elderRequest.paymentStatus === "success")
      return res.status(400).json({ message: "Payment already completed" });

    // Create mock session
    const session = {
      id: `mock_session_${requestId}_${Date.now()}`,
      requestId,
      amount: 500, // elder account fee
      currency: "usd",
      status: "pending",
      url: `${process.env.CLIENT_URL}/payment-success/${requestId}`,
      cancelUrl: `${process.env.CLIENT_URL}/payment-cancel/${requestId}`,
    };

    mockPayments.push(session);

    res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Mock payment session creation failed" });
  }
};

// Update payment status (simulate success/failure)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // "success" or "failed"

    const elderRequest = await ElderRequest.findById(requestId);
    if (!elderRequest)
      return res.status(404).json({ message: "Request not found" });

    elderRequest.paymentStatus = status;
    await elderRequest.save();

    // Update mock session
    const session = mockPayments.find((p) => p.requestId === requestId);
    if (session) session.status = status;

    res
      .status(200)
      .json({ message: "Payment status updated", paymentStatus: status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment status update failed" });
  }
};
