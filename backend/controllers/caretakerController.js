import Elder from "../models/elder_model.js";
import Staff from "../models/staff_model.js";
import Caretaker from "../models/caretaker_model.js";

export const assignCaretaker = async (req, res) => {
    try {
        const { caretakerId, elderId } = req.body;

        const staff = await Staff.findById(caretakerId);
        if (!staff || staff.role !== "caretaker") {
            return res.status(400).json({ message: "Invalid caretaker staff" });
        }

        const elder = await Elder.findById(elderId).populate("guardian");
        if (!elder) {
            return res.status(400).json({ message: "Elder not found" });
        }

        let caretaker = await Caretaker.findOne({ staff: caretakerId });
        if (!caretaker) {
            caretaker = new Caretaker({ staff: caretakerId, assignedElders: [] });
        }

        if (elder.status === "APPROVED_AWAITING_PAYMENT") {
            elder.status = "ACTIVE";
        }

        if (!caretaker.assignedElders.includes(elderId)) {
            caretaker.assignedElders.push(elderId);
        }
        await caretaker.save();

        elder.caretaker = caretaker._id;
        await elder.save();

        res.json({ message: "Caretaker assigned successfully", elder });
    } catch (error) {
        console.error("Assign caretaker error:", error);
        res.status(500).json({ message: error.message });
    }
};
