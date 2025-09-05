import mongoose from "mongoose";
import Room from "../models/roomModel.js";


export const getRooms = async (req, res) => {
    try {
        const { floor, type, status, q } = req.query;

        const where = {};
        if (floor) where.floor = floor;
        if (type) where.type = type;
        if (status) where.status = status;
        if (q) where.room_id = new RegExp(String(q).trim(), "i");

        const rooms = await Room.find(where).sort({ floor: 1, room_id: 1, createdAt: -1 });
        res.status(200).json({ success: true, data: rooms });
    } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/** POST /api/rooms */
export const addRoom = async (req, res) => {
    try {
        const { room_id, floor, type, status } = req.body;

        if (!room_id || !floor || !type) {
            return res.status(400).json({ success: false, message: "room_id, floor, type are required" });
        }

        if (status === "occupied") {
            return res.status(400).json({
                success: false,
                message: "Cannot create a room as 'occupied'. Use the assignment endpoint.",
            });
        }

        const doc = {
            room_id: String(room_id).trim(),
            floor: String(floor).trim(),
            type: String(type).trim(),
        };
        if (status) doc.status = String(status).trim();

        const created = await Room.create(doc);
        res.status(201).json({ success: true, data: created });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ success: false, message: "room_id already exists" });
        }
        console.error("Error creating room:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/** DELETE /api/rooms/:id */
export const deleteRoom = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid room ID" });
    }

    // also it'll prevent deleting a room if its assigned to an elder

    try {
        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }
        if (room.status === "occupied" || room.elder) {
            return res.status(400).json({
                success: false,
                message: "Room is occupied. Release/Unassign before deleting.",
            });
        }

        await Room.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Deleted successfully" });
    } catch (error) {
        console.error("Error deleting room:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/** PUT /api/rooms/:id */
export const updateRoom = async (req, res) => {
    const { id } = req.params;
    const payload = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid room ID" });
    }

    if (payload.elder !== undefined) {
        return res.status(400).json({
            success: false,
            message: "Assignment of elders is not allowed",
        });
    }

    if (payload.status === "occupied") {
        return res.status(400).json({
            success: false,
            message: "Cannot set status to 'occupied'.",
        });
    }

    const update = {};
    if (payload.room_id !== undefined) update.room_id = String(payload.room_id).trim();
    if (payload.floor !== undefined) update.floor = String(payload.floor).trim();
    if (payload.type !== undefined) update.type = String(payload.type).trim();
    if (payload.status !== undefined) update.status = String(payload.status).trim();

    try {
        const updated = await Room.findByIdAndUpdate(id, update, {
            new: true,
            runValidators: true,
        });
        if (!updated) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ success: false, message: "Room already exists" });
        }
        console.error("Error updating room:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
