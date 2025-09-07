// routes/caretaker_elder_routes.js
import express from "express";
import mongoose from "mongoose";
import { protectStaff } from "../middleware/staffAuth.js";
import Caretaker from "../models/caretaker_model.js";
import Room from "../models/room_model.js";

const router = express.Router();

/**
 * GET /api/caretaker/elders/my
 * Elders assigned to the logged-in caretaker, with their room (if any).
 */
router.get("/my", protectStaff, async (req, res) => {
    try {
        if (!req.staff || req.staff.role !== "caretaker") {
            return res.status(403).json({ message: "Access denied: caretaker role required" });
        }

        // 1) Get caretaker + assigned elders (with guardian summary)
        const caretakerDoc = await Caretaker.findOne({ staff: req.staff._id })
            .populate({
                path: "assignedElders",
                select: "fullName dob gender medicalNotes guardian createdAt status isDisabled",
                populate: [{ path: "guardian", select: "name phone", options: { strictPopulate: false } }],
                options: { strictPopulate: false },
            })
            .lean();

        if (!caretakerDoc) {
            return res.status(404).json({ message: "No caretaker profile found for this staff user" });
        }

        const elders = caretakerDoc.assignedElders || [];
        if (elders.length === 0) {
            return res.json({ caretakerId: caretakerDoc._id, staffId: req.staff._id, count: 0, elders: [] });
        }

        // 2) Fetch rooms for these elders
        const elderIds = elders.map((e) => e._id);
        const rooms = await Room.find(
            { elder: { $in: elderIds } },
            "room_id floor type status elder"
        ).lean();

        const roomByElder = new Map(rooms.map((r) => [String(r.elder), r]));

        // 3) Attach room summary to each elder
        const eldersOut = elders.map((e) => {
            const r = roomByElder.get(String(e._id));
            return {
                ...e,
                room: r
                    ? { room_id: r.room_id, floor: r.floor, type: r.type, status: r.status }
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
        return res.status(500).json({ message: "Server error while fetching assigned elders" });
    }
});

/**
 * GET /api/caretaker/elders/:id
 * Full details for a single elder assigned to this caretaker (+room).
 */
router.get("/:id", protectStaff, async (req, res) => {
    try {
        if (!req.staff || req.staff.role !== "caretaker") {
            return res.status(403).json({ message: "Access denied: caretaker role required" });
        }

        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid elder id" });
        }

        // Load caretaker and filter to only this elder ID
        const caretakerDoc = await Caretaker.findOne({ staff: req.staff._id })
            .populate({
                path: "assignedElders",
                match: { _id: id },
                select: "fullName dob gender medicalNotes guardian createdAt status isDisabled",
                populate: [{ path: "guardian", select: "name phone", options: { strictPopulate: false } }],
                options: { strictPopulate: false },
            })
            .lean();

        if (!caretakerDoc) {
            return res.status(404).json({ message: "No caretaker profile found for this staff user" });
        }

        const elder = (caretakerDoc.assignedElders || [])[0];
        if (!elder) {
            return res.status(404).json({ message: "Elder not found or not assigned to you" });
        }

        // Add room info
        const room = await Room.findOne({ elder: elder._id }, "room_id floor type status").lean();

        return res.json({
            caretakerId: caretakerDoc._id,
            staffId: req.staff._id,
            elder: {
                ...elder,
                room: room
                    ? { room_id: room.room_id, floor: room.floor, type: room.type, status: room.status }
                    : null,
            },
        });
    } catch (err) {
        console.error("Error fetching elder detail:", err);
        return res.status(500).json({ message: "Server error while fetching elder detail" });
    }
});

export default router;