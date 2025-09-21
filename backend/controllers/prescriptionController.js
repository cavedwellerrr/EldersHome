// import Prescription from "../models/prescription_model.js";

// // Doctor creates prescription
// export const createPrescription = async (req, res) => {
//   try {
//     const { appointmentId, elderId, caretakerId, doctorId, diagnosis, items, notes } = req.body;

//     if (!appointmentId || !elderId || !caretakerId || !doctorId || !items?.length) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const prescription = new Prescription({
//       appointment: appointmentId,
//       elder: elderId,
//       caretaker: caretakerId,
//       doctor: doctorId,
//       diagnosis,
//       items,
//       notes
//     });

//     await prescription.save();
//     res.status(201).json(prescription);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Get prescriptions by elder
// export const getPrescriptionsByElder = async (req, res) => {
//   try {
//     const { elderId } = req.params;
//     const prescriptions = await Prescription.find({ elder: elderId })
//       .populate("doctor", "staff.name specialization")
//       .sort({ issuedAt: -1 });

//     res.json(prescriptions);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };