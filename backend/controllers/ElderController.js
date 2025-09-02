import Elder from "../models/elder_model.js";
import Operator from "../models/operator_model.js";
import ElderRequest from "../models/elderRequest_model.js";
import { sendEmail } from "../services/emailService.js";

export const assignElderDetails = async (req, res) => {
  try {
    const { elderId } = req.params;
    const updateData = req.body;

    const elder = await Elder.findByIdAndUpdate(elderId, updateData, {
      new: true,
    });
    if (!elder) return res.status(404).json({ message: "Elder not found" });

    res.json({ message: "Elder details updated", elder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// View all elders
export const getAllElders = async (req, res) => {
  try {
    const elders = await Elder.find()
      .populate("guardian", "name email")
      .populate("caretaker", "name email");
    res.json(elders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign room and caretaker (activate elder)
export const assignRoomAndCaretaker = async (req, res) => {
  try {
    const { elderId } = req.params;
    const { room, caretakerId } = req.body;

    const elder = await Elder.findById(elderId).populate("guardian");
    if (!elder) return res.status(404).json({ message: "Elder not found" });

    elder.room = room;
    elder.caretaker = caretakerId;
    elder.isActive = true;
    await elder.save();

    const request = await ElderRequest.findOne({ elder: elder._id });
    if (request) request.status = "approved";
    await request.save();

    const operator = await Operator.findById(req.user._id);
    operator.processedPayments = operator.processedPayments.map((p) => {
      if (p.elder.toString() === elder._id.toString()) {
        p.status = "success";
      }
      return p;
    });
    await operator.save();

    await sendEmail(
      elder.guardian.email,
      "Elder Account Activated",
      `<p>Dear ${elder.guardian.name},</p>
       <p>Your elder ${elder.name} has been assigned a room and caretaker. The account is now active.</p>
       <p>Room: ${room}</p>
       <p>Caretaker ID: ${caretakerId}</p>`
    );

    res.json({
      message: "Room and caretaker assigned, elder activated",
      elder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve elder request (simpler version for route)
export const approveElderRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await ElderRequest.findById(requestId).populate("guardian");
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "approved";
    await request.save();

    res.json({ message: "Elder request approved", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject elder request
export const rejectElderRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await ElderRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "rejected";
    await request.save();

    res.json({ message: "Elder request rejected", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
