import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        room_id: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            uppercase:true,
        },
        floor: {
            type: String,
            required: true,
            enum: ["Ground", "1", "2", "3"],
            index: true,
        },
        type: {
            type: String,
            required: true,
            enum: ["AC", "Non-AC"],
            index: true,
        },
        status: {
            type: String,
            enum: ["available", "occupied", "maintenance", "reserved"],
            default: "available",
            index: true,
        },
        // 1:1 relationship 
        elder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Elder",
            default: null,
        },
    },
    { timestamps: true }
);

// can be used in search pages
roomSchema.index({ floor: 1, type: 1, status: 1 });

const Room = mongoose.model("Room", roomSchema);
export default Room;