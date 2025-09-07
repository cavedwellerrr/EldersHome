//routes/caretaker_elder_routes.js
import express from "express";
import { protectStaff } from "../middleware/staffAuth.js";
import Caretaker from "../models/caretaker_model.js";
import Room from "../models/room_model.js"; // <-- add this import

const router = express.Router();

/**
 * GET /api/caretaker/elders/my
 * Return elders assigned to the logged-in caretaker.
 */
router.get("/my", protectStaff, async (req, res) => {
    try {
        if (!req.staff || req.staff.role !== "caretaker") {
            return res
                .status(403)
                .json({ message: "Access denied: caretaker role required" });
        }

        // 1) Get the caretaker doc and populate assigned elders + their guardian
        const caretakerDoc = await Caretaker.findOne({ staff: req.staff._id })
            .populate({
                path: "assignedElders",
                select:
                    "fullName dob gender medicalNotes guardian createdAt status isDisabled",
                populate: [{ path: "guardian", select: "name phone", options: { strictPopulate: false } }],
                options: { strictPopulate: false },
            })
            .lean();

        if (!caretakerDoc) {
            return res
                .status(404)
                .json({ message: "No caretaker profile found for this staff user" });
        }

        const elders = caretakerDoc.assignedElders || [];
        if (elders.length === 0) {
            return res.json({
                caretakerId: caretakerDoc._id,
                staffId: req.staff._id,
                count: 0,
                elders: [],
            });
        }

        // 2) Find rooms for these elders (Room has { elder: ObjectId })
        const elderIds = elders.map((e) => e._id);
        const rooms = await Room.find(
            { elder: { $in: elderIds } },
            "room_id floor type status elder"
        ).lean();

        const roomByElder = new Map(rooms.map((r) => [String(r.elder), r]));

        // 3) Attach room info to each elder
        const eldersOut = elders.map((e) => {
            const room = roomByElder.get(String(e._id)) || null;
            return {
                ...e,
                // normalize to a nested room object your frontend can read easily
                room: room
                    ? {
                        room_id: room.room_id,
                        floor: room.floor,
                        type: room.type,
                        status: room.status,
                    }
                    : null,
            };
        });

        return res.json({
            caretakerId: caretakerDoc._id,
            staffId: req.staff._id,
            count: eldersOut.length,
            elders: eldersOut,
        });
    } catch (err) {
        console.error("Error fetching assigned elders:", err);
        return res
            .status(500)
            .json({ message: "Server error while fetching assigned elders" });
    }
});

export default router;
