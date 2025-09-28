import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Connect socket outside component to avoid multiple connections
const socket = io("http://localhost:5000");

export default function ChatBox({ userId = "guest" }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    // Join user-specific room
    socket.emit("joinChat", { userId });

    // Listen for bot replies
    socket.on("botReply", ({ reply, options }) => {
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    });

    // Listen for staff replies (sent to room)
    socket.on("staffReply", ({ reply }) => {
      setMessages((prev) => [...prev, { sender: "staff", text: reply }]);
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off("botReply");
      socket.off("staffReply");
    };
  }, [userId]);

  const sendMessage = () => {
    if (!input.trim()) return;

    // Add user's message to UI
    setMessages((prev) => [...prev, { sender: "user", text: input }]);

    // Send message to server
    socket.emit("userMessage", { userId, message: input });

    setInput("");
  };

  return (
    <div className="chat-container fixed bottom-5 right-5 w-80 bg-white shadow-lg rounded-lg flex flex-col">
      <div className="header bg-orange-500 text-white font-bold p-3 rounded-t-lg">
        ElderCare Chat
      </div>

      <div className="messages flex-1 p-3 overflow-y-auto h-64">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 p-2 rounded-lg max-w-[70%] ${
              msg.sender === "user"
                ? "bg-orange-100 ml-auto text-right"
                : msg.sender === "staff"
                ? "bg-gray-200 text-left"
                : "bg-gray-300 italic"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input flex border-t border-gray-300">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 p-2 rounded-bl-lg outline-none"
        />
        <button
          onClick={sendMessage}
          className="bg-orange-500 text-white px-4 rounded-br-lg hover:bg-orange-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
