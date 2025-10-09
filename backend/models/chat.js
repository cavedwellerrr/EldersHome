import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // "guest" if not logged in
  sender: { type: String, enum: ["user", "bot", "staff"], required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["open", "resolved"], default: "open" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Chat", chatSchema);