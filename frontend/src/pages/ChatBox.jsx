import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function ChatBox({ userId = "guest", onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [messageDelivered, setMessageDelivered] = useState(true);
  const [isInSupport, setIsInSupport] = useState(false);
  const messagesEndRef = useRef(null);
  const timeoutRef = useRef(null);
  // Generate a unique session ID for each component mount (e.g., on page refresh)
  const sessionId = useRef(
    Math.random().toString(36).substring(2) + Date.now().toString(36)
  ).current;

  const suggestions = ["Hello", "Register", "Donation", "Support"];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    setMessages([{ sender: "bot", text: "Welcome to ElderCare Chat! How can I assist you?" }]);
  }, []);

  useEffect(() => {
    // Exit any previous support session for this userId to reset server state
    socket.emit("exitSupport", { userId });
    
    // Then join the chat with the new sessionId
    socket.emit("joinChat", { userId, sessionId });

    socket.on("botReply", ({ reply, options }) => {
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
      setMessageDelivered(true);
    });

    socket.on("staffReply", ({ reply }) => {
      setMessages((prev) => [...prev, { sender: "staff", text: reply }]);
      setMessageDelivered(true);
    });

    socket.on("messageDelivered", () => {
      setMessageDelivered(true);
    });

    socket.on("endSupport", () => {
      setMessages((prev) => [...prev, { sender: "bot", text: "Support session has ended." }]);
      setIsInSupport(false);
      if (onClose) setTimeout(() => onClose(), 2000);
    });

    return () => {
      socket.emit("leaveChat", { userId, sessionId }); // Leave the chat room on unmount (e.g., refresh or close)
      socket.off("botReply");
      socket.off("staffReply");
      socket.off("messageDelivered");
      socket.off("endSupport");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [userId, sessionId, onClose]);

  // Handle inactivity timeout for support sessions
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || !isInSupport) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Exiting support session due to inactivity." },
      ]);
      // Notify server to exit the staff chat room
      socket.emit("exitSupport", { userId, sessionId });
      // Reset messages to initial state
      setMessages([{ sender: "bot", text: "Welcome to ElderCare Chat! How can I assist you?" }]);
      setMessageDelivered(true); // Reset delivery status
      setIsInSupport(false);
      if (onClose) setTimeout(() => onClose(), 2000); // Close chat after 2 seconds
    }, 5 * 60 * 1000); // 5 minutes timeout

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [messages, isInSupport, userId, sessionId, onClose]);

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    socket.emit("userMessage", { userId, sessionId, message: input });
    setMessageDelivered(false);
    setInput("");
  };

  const handleSuggestion = (text) => {
    setMessages((prev) => [...prev, { sender: "user", text }]);
    socket.emit("userMessage", { userId, sessionId, message: text });
    setMessageDelivered(false);

    if (text === "Support") {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Now you are chatting with our user support. You can solve your matter with our user support. Please share your matter.",
        },
      ]);
      setMessageDelivered(true);
      setIsInSupport(true);
    }
  };

  return (
    <div className="chat-container fixed bottom-16 right-5 w-80 bg-white shadow-lg rounded-lg flex flex-col z-50 h-96">
      <div className="header bg-orange-500 text-white font-bold p-3 rounded-t-lg">
        ElderCare Chat
      </div>

      <div className="messages flex-1 p-3 overflow-y-auto" style={{ height: 'calc(100% - 6rem - 4rem)' }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 p-2 rounded-lg max-w-[70%] ${
              msg.sender === "user"
                ? "bg-orange-100 text-black ml-auto text-right"
                : msg.sender === "staff"
                ? "bg-gray-200 text-black text-left"
                : "bg-gray-300 text-black italic text-left"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="suggestions p-3 flex flex-wrap gap-2 border-t border-gray-300 min-h-12">
        {suggestions.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => handleSuggestion(sug)}
            className="bg-orange-200 text-black px-2 py-1 rounded-full hover:bg-orange-300 text-sm"
          >
            {sug}
          </button>
        ))}
      </div>

      <div className="input flex border-t border-gray-300 h-12">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 p-2 rounded-bl-lg outline-none text-white"
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