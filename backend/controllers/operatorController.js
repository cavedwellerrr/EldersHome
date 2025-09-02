// backend/controllers/operatorController.js
import ElderRequest from "../models/elder_model.js"; // Adjust model import if needed

// Get all pending elder requests
export const getPendingElderRequests = async (req, res) => {
  try {
    const requests = await ElderRequest.find({ status: "pending" });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve an elder request
export const approveElderRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await ElderRequest.findByIdAndUpdate(id, { status: "approved" });
    res.json({ message: "Request approved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject an elder request
export const rejectElderRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await ElderRequest.findByIdAndUpdate(id, { status: "rejected" });
    res.json({ message: "Request rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Assign elder details (example)
export const assignElderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { caretakerId } = req.body;
    await ElderRequest.findByIdAndUpdate(id, {
      assignedCaretaker: caretakerId,
    });
    res.json({ message: "Elder assigned successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Process payment (if applicable)
export const processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    // Add payment logic here
    res.json({ message: "Payment processed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
