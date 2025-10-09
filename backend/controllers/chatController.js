import Chat from "../models/chat.js";

export const chatController = async (req, res) => {
  const { message, userId = "guest" } = req.body;
  const lowerMsg = message.toLowerCase().trim();

  let reply =
    "Sorry, I didn't understand that. Try 'register', 'booking' or 'support'.";
  let options = [];

  if (lowerMsg === "hi" || lowerMsg === "hello") {
    reply = "Hello 👋 Welcome to ElderCare Support! You can ask about:";
    options = ["register", "booking", "support"];
  } else if (lowerMsg.includes("register")) {
    reply =
      "To register, click on the 'Register' button in the top menu and fill your details.";
  } else if (lowerMsg.includes("booking")) {
    reply =
      "To book an event, go to 'Events' → select your event → click 'Book Now'.";
  } else if (lowerMsg.includes("support")) {
    reply = "Okay, connecting you to customer support...";
    // Save user request for staff
    await Chat.create({ userId, sender: "user", message, status: "open" });
    return res.json({ reply, options: [] });
  }

  // Save both user and bot messages
  await Chat.create({ userId, sender: "user", message });
  await Chat.create({ userId, sender: "bot", message: reply });

  res.json({ reply, options });
};