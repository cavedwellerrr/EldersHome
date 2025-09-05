// import Caretaker from "../../models/caretaker_model.js"; // adjust path if needed
// import Elder from "../../models/elder_model.js";

// // GET /api/caretaker/elders/my
// export const getMyAssignedElders = async (req, res) => {
//     try {
//         // req.staff is set by protectStaff (Bearer token)
//         const staffId = req.staff?._id;

//         if (!staffId) {
//             return res.status(401).json({ message: "Not authorized" });
//         }

//         // Find caretaker doc linked to this staff account
//         const caretaker = await Caretaker.findOne({ staff: staffId }).select("_id assignedElders");
//         if (!caretaker) {
//             return res.status(404).json({ message: "Caretaker profile not found for this staff account" });
//         }

//         let elders = [];

//         // Prefer assignedElders array if it has values
//         if (caretaker.assignedElders && caretaker.assignedElders.length > 0) {
//             elders = await Elder.find({ _id: { $in: caretaker.assignedElders } })
//                 .select("fullName dob status medicalNotes pdfPath guardian")
//                 .populate("guardian", "name email phone")
//                 .lean();
//         } else {
//             // Fallback: elders that reference this caretaker
//             elders = await Elder.find({ caretaker: caretaker._id })
//                 .select("fullName dob status medicalNotes pdfPath guardian")
//                 .populate("guardian", "name email phone")
//                 .lean();
//         }

//         return res.json({
//             caretaker: caretaker._id,
//             count: elders.length,
//             elders,
//         });
//     } catch (error) {
//         console.error("getMyAssignedElders error:", error);
//         return res.status(500).json({ message: "Server error", error: error.message });
//     }
// };

// // OPTIONAL: scope check for a single elder belongs to this caretaker
// // GET /api/caretaker/elders/:elderId
// export const getMyElderById = async (req, res) => {
//     try {
//         const staffId = req.staff?._id;
//         const { elderId } = req.params;

//         const caretaker = await Caretaker.findOne({ staff: staffId }).select("_id assignedElders");
//         if (!caretaker) return res.status(404).json({ message: "Caretaker profile not found" });

//         // Check access via either mapping
//         const byArray = caretaker.assignedElders?.some(id => String(id) === String(elderId));
//         const elder = byArray
//             ? await Elder.findById(elderId)
//             : await Elder.findOne({ _id: elderId, caretaker: caretaker._id });

//         if (!elder) return res.status(404).json({ message: "Elder not found or not assigned to you" });

//         const doc = await Elder.findById(elder._id)
//             .select("fullName dob status medicalNotes pdfPath guardian")
//             .populate("guardian", "name email phone")
//             .lean();

//         return res.json(doc);
//     } catch (error) {
//         console.error("getMyElderById error:", error);
//         return res.status(500).json({ message: "Server error", error: error.message });
//     }
// };
