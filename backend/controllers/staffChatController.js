import Chat from "../models/chat.js";

// Get all open chats
export const getOpenChats = async (req, res) => {
  const chats = await Chat.find({ status: "open" }).sort({ createdAt: 1 });
  res.json(chats);
};

// Staff reply to a chat
export const replyToChat = async (req, res) => {
  const { userId, reply } = req.body;

  // Save staff reply
  await Chat.create({ userId, sender: "staff", message: reply });

  res.json({ success: true });
};

// Mark conversation as resolved
export const closeChat = async (req, res) => {
  const { userId } = req.body;
  await Chat.updateMany({ userId, status: "open" }, { status: "resolved" });
  res.json({ success: true });
};