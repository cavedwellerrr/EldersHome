import Consultation from "../models/consultation_model.js";

// caretaker books consultation
export const createConsultation = async (req, res) => {
  try {
    const { elderName, caretakerId, specialty, priority, reason } = req.body;

    const consultation = new Consultation({
      elderName,
      caretakerId,
      specialty,
      priority,
      reason,
    });

    await consultation.save(); 
    res.status(201).json(consultation);
  } catch (error) {
    res.status(500).json({ message: "Error creating consultation" });
  }
};

// get consultations for a caretaker
export const getConsultationsByCaretaker = async (req, res) => {
  try {
    const { caretakerId } = req.params;
    const consultations = await Consultation.find({ caretakerId }).sort({
      createdAt: -1,
    });
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching consultations" });
  }
};

// doctor updates status
export const updateConsultationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await Consultation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating consultation" });
  }
};
