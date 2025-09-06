// controllers/consultationController.js
import Consultation from "../models/consultation_model.js";
import Elder from "../models/elder_model.js";
import Caretaker from "../models/caretaker_model.js";
import Appointment from "../models/appointment_model.js"; // ✅ import appointment model

// Caretaker requests a consultation
export const requestConsultation = async (req, res) => {
  try {
    const { elderId, caretakerId, reason, priority } = req.body;

    if (!elderId || !caretakerId || !reason) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // check elder exists
    const elder = await Elder.findById(elderId);
    if (!elder) return res.status(404).json({ message: "Elder not found" });

    // check caretaker exists
    const caretaker = await Caretaker.findById(caretakerId).populate("staff");
    if (!caretaker) return res.status(404).json({ message: "Caretaker not found" });

    // create consultation
    const consultation = new Consultation({
      elder: elderId,
      caretaker: caretakerId,
      reason,
      priority,
    });

    await consultation.save();
    res.status(201).json({
      message: "Consultation request submitted successfully",
      consultation,
    });
  } catch (error) {
    console.error("Error creating consultation:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Doctor views pending consultations
export const listPendingConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ status: "Pending" })
      .populate("elder", "fullName dob guardian")
      .populate({
        path: "caretaker",
        populate: { path: "staff", select: "name email" },
      });

    res.status(200).json(consultations);
  } catch (error) {
    console.error("Error listing consultations:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Doctor updates consultation (Approve/Reject)
export const updateConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, responseNotes, doctorId, date } = req.body;

    const consultation = await Consultation.findById(id)
      .populate("elder caretaker");

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    consultation.status = status || consultation.status;
    consultation.responseNotes = responseNotes || consultation.responseNotes;
    consultation.doctor = doctorId || consultation.doctor;
    await consultation.save();

    // ✅ If Approved → create appointment
    if (status === "Approved" && date) {
      const appointment = new Appointment({
        elder: consultation.elder._id,
        guardian: consultation.elder.guardian, // elder has guardian reference
        doctor: doctorId,
        caretaker: consultation.caretaker, // caretaker staff
        date,
        status: "pending",
        notes: responseNotes || "",
        
      });
      await appointment.save();

      return res.json({
        message: "Consultation approved and appointment created",
        consultation,
        appointment,
      });
    }

    // ✅ If Rejected
    if (status === "Rejected") {
      return res.json({
        message: "Consultation rejected",
        consultation,
      });
    }

    res.json({ message: `Consultation updated`, consultation });
  } catch (error) {
    console.error("Error updating consultation:", error);
    res.status(500).json({ message: error.message });
  }
};
//get Consultss
// 🚨 TEST ONLY: Return all consultations (no role check)
export const getMyConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .populate("elder", "fullName guardian dob")
      .populate({
        path: "doctor",
        populate: { path: "staff", select: "name email" },
      })
      .populate({
        path: "caretaker",
        populate: { path: "staff", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.json(consultations);
  } catch (err) {
    console.error("Error fetching consultations:", err);
    res
      .status(500)
      .json({ message: "Error fetching consultations" });
  }
};
