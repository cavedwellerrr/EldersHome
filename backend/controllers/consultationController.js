// controllers/consultationController.js
import Consultation from "../models/consultation_model.js";
import Elder from "../models/elder_model.js";
import Caretaker from "../models/caretaker_model.js";
import Appointment from "../models/Appointment_model.js"; //  import appointment model
import Doctor from "../models/doctor_model.js";


// Caretaker requests a consultation
export const requestConsultation = async (req, res) => {
  try {
    const { elderId, caretakerId, doctorId, reason, priority } = req.body;

    if (!elderId || !caretakerId|| !doctorId  || !reason) {
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
       doctor: doctorId,
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

//  Doctor views pending consultations


//  Doctor updates consultation (Approve/Reject)
export const updateConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, responseNotes, doctorId, date } = req.body;

    const consultation = await Consultation.findById(id)
      .populate("elder caretaker");

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    //  always update these fields
    if (status) consultation.status = status;
    if (responseNotes) consultation.responseNotes = responseNotes;
    if (doctorId) consultation.doctor = doctorId;

    await consultation.save(); //  make sure doctorId is saved in consultation

    //  If Approved → create appointment
    if (status === "Approved" && date) {
      const caretakerDoc = await Caretaker.findById(consultation.caretaker)
        .populate("staff");

      const appointment = new Appointment({
        elder: consultation.elder._id,
        guardian: consultation.elder.guardian,
        doctor: doctorId, //  linked here as well
        caretaker: caretakerDoc?.staff?._id,
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

    //  If Rejected
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

//get Consultss for caretaker




// controllers/consultationController.js
export const deleteConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findByIdAndDelete(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }
    res.json({ message: "Consultation deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// controllers/consultationController.js
export const rejectConsultation = async (req, res) => {
  try {
    const { note } = req.body;
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    consultation.status = "Rejected";
    consultation.responseNotes = note;   //  save into responseNotes
    await consultation.save();

    res.json({ message: "Consultation rejected", consultation });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


