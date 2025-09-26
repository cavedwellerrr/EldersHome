
import mongoose from "mongoose";
import Room from "../models/room_model.js";
import Elder from "../models/elder_model.js";


export const getCurrentRoomForElder = async (req, res) => {
    try {
        const { elderId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(elderId)) {
            return res.status(400).json({ success: false, message: "Invalid elderId" });
        }

        const elder = await Elder.findById(elderId).lean();
        if (!elder) return res.status(404).json({ success: false, message: "Elder not found" });

        const room = await Room.findOne({ elder: elderId }, "room_id floor type status").lean();
        return res.json({ success: true, room: room || null });
    } catch (err) {
        console.error("getCurrentRoomForElder error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


export const listAvailableRooms = async (req, res) => {
    try {
        const { floor, type, q } = req.query;
        const where = { status: "available", elder: null };
        if (floor) where.floor = String(floor).trim();
        if (type) where.type = String(type).trim();
        if (q) where.room_id = new RegExp(String(q).trim(), "i");

        const rooms = await Room.find(where, "room_id floor type status")
            .sort({ floor: 1, room_id: 1 })
            .lean();

        return res.json({ success: true, count: rooms.length, rooms });
    } catch (err) {
        console.error("listAvailableRooms error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


export const assignRoomToElder = async (req, res) => {
    try {
        const { elderId, room_id } = req.body;

        if (!elderId || !mongoose.Types.ObjectId.isValid(elderId)) {
            return res.status(400).json({ success: false, message: "Invalid elderId" });
        }
        if (!room_id) {
            return res.status(400).json({ success: false, message: "room_id is required" });
        }

        const elder = await Elder.findById(elderId);
        if (!elder) return res.status(404).json({ success: false, message: "Elder not found" });

        const room = await Room.findOne({ room_id: String(room_id).trim() });
        if (!room) return res.status(404).json({ success: false, message: "Room not found" });

        // room must be available or already owned by this elder
        if (room.status !== "available" && String(room.elder) !== String(elderId)) {
            return res.status(409).json({ success: false, message: "Room not available" });
        }
        if (room.elder && String(room.elder) !== String(elderId)) {
            return res.status(409).json({ success: false, message: "Room assigned to another elder" });
        }

        
        await Room.updateMany(
            { elder: elder._id, room_id: { $ne: room.room_id } },
            { $set: { elder: null, status: "available" } }
        );

        // Assign elder to this room
        room.elder = elder._id;
        room.status = "occupied";
        await room.save();

        return res.json({
            success: true,
            message: `Assigned elder to room ${room.room_id}`,
            room: { room_id: room.room_id, floor: room.floor, type: room.type, status: room.status },
        });
    } catch (err) {
        console.error("assignRoomToElder error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


export const unassignRoomFromElder = async (req, res) => {
    try {
        const { elderId } = req.body;
        if (!elderId || !mongoose.Types.ObjectId.isValid(elderId)) {
            return res.status(400).json({ success: false, message: "Invalid elderId" });
        }

        const updated = await Room.findOneAndUpdate(
            { elder: elderId },
            { $set: { elder: null, status: "available" } },
            { new: true }
        );

        return res.json({
            success: true,
            message: updated ? `Unassigned room ${updated.room_id}` : "Elder had no room",
            room: updated
                ? { room_id: updated.room_id, floor: updated.floor, type: updated.type, status: updated.status }
                : null,
        });
    } catch (err) {
        console.error("unassignRoomFromElder error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};