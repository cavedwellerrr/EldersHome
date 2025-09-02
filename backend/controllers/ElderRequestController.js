// backend/controllers/ElderRequestController.js
import ElderRequest from "../models/elderRequest_model.js";

// Create a new elder request
export const createElderRequest = async (req, res) => {
  try {
    const { elderName, age, notes } = req.body;

    if (!elderName || !age) {
      return res.status(400).json({ message: "Name and age are required" });
    }

    const newRequest = await ElderRequest.create({
      elderName,
      age,
      notes,
      requestedBy: req.user.id,
    });

    res
      .status(201)
      .json({ message: "Elder request created", data: newRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve an elder request (admin only)
export const approveElderRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await ElderRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "approved";
    await request.save();

    res.status(200).json({ message: "Elder request approved", data: request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Activate an elder after approval
export const activateElder = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await ElderRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "approved") {
      return res
        .status(400)
        .json({ message: "Request must be approved first" });
    }

    request.status = "active";
    await request.save();

    res
      .status(200)
      .json({ message: "Elder activated successfully", data: request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all elder requests (admin)
export const getAllElderRequests = async (req, res) => {
  try {
    const requests = await ElderRequest.find().populate("user", "name email");
    res.status(200).json({ data: requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get elder requests of the logged-in guardian
export const getMyElderRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await ElderRequest.find({ user: userId });
    res.status(200).json({ data: requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//reject
export const rejectElderRequest = async (req, res) => {
  try {
    const request = await ElderRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "rejected";
    await request.save();
    res.status(200).json({ message: "Request rejected", request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const assignElderDetails = async (req, res) => {
  try {
    const { elderId, roomNumber, caretaker } = req.body;
    const request = await ElderRequest.findById(elderId);
    if (!request)
      return res.status(404).json({ message: "Elder request not found" });

    // Assign details
    request.roomNumber = roomNumber || request.roomNumber;
    request.caretaker = caretaker || request.caretaker;
    request.status = "assigned";

    await request.save();
    res.status(200).json({ message: "Elder details assigned", request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
