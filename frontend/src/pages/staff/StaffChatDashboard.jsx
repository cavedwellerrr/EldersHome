// StaffChatDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { socket } from "../../utils/socket"; 
import { v4 as uuidv4 } from "uuid";

export default function StaffChatDashboard({ onClose }) {
  const [activeUsers, setActiveUsers] = useState([]); // List of {userId, lastMessage}
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [chatHistory, setChatHistory] = useState({}); // {userId: [{sender, message, createdAt}]}
  const [reply, setReply] = useState("");
  const componentId = React.useMemo(() => uuidv4(), []);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Handle initial active users
    const handleActiveSupports = ({ activeUsers }) => {
      setActiveUsers(activeUsers);
    };

    // Handle new support request
    const handleSupportRequest = ({ userId, sender, message, createdAt }) => {
      setActiveUsers((prev) => {
        const exists = prev.find((u) => u.userId === userId);
        if (exists) {
          return prev.map((u) => (u.userId === userId ? { ...u, lastMessage: { sender, message, createdAt } } : u));
        }
        return [...prev, { userId, lastMessage: { sender, message, createdAt } }];
      });

      setChatHistory((prev) => {
        const userHistory = prev[userId] || [];
        if (userHistory.some((msg) => msg.message === message && msg.createdAt === createdAt)) {
          return prev;
        }
        return { ...prev, [userId]: [...userHistory, { sender, message, createdAt }] };
      });

      if (selectedUserId === userId) {
        scrollToBottom();
      }
    };

    // Handle staff reply broadcast
    const handleStaffReply = ({ userId, sender, message, createdAt }) => {
      setChatHistory((prev) => {
        const userHistory = prev[userId] || [];
        return { ...prev, [userId]: [...userHistory, { sender, message, createdAt }] };
      });

      setActiveUsers((prev) => prev.map((u) => (u.userId === userId ? { ...u, lastMessage: { sender, message, createdAt } } : u)));

      if (selectedUserId === userId) {
        scrollToBottom();
      }
    };

    // Handle end support
    const handleEndSupport = ({ userId }) => {
      setActiveUsers((prev) => prev.filter((u) => u.userId !== userId));
      setChatHistory((prev) => {
        const newHistory = { ...prev };
        delete newHistory[userId];
        return newHistory;
      });
      if (selectedUserId === userId) {
        setSelectedUserId(null);
      }
    };

    // Handle chat history
    const handleChatHistory = ({ userId, history }) => {
      setChatHistory((prev) => ({ ...prev, [userId]: history }));
      scrollToBottom();
    };

    socket.on(`activeSupports-${componentId}`, handleActiveSupports);
    socket.on(`supportRequest-${componentId}`, handleSupportRequest);
    socket.on(`staffReply-${componentId}`, handleStaffReply);
    socket.on(`endSupport-${componentId}`, handleEndSupport);
    socket.on("chatHistory", handleChatHistory);

    socket.emit("staffDashboardActive", { componentId });

    return () => {
      socket.off(`activeSupports-${componentId}`, handleActiveSupports);
      socket.off(`supportRequest-${componentId}`, handleSupportRequest);
      socket.off(`staffReply-${componentId}`, handleStaffReply);
      socket.off(`endSupport-${componentId}`, handleEndSupport);
      socket.off("chatHistory", handleChatHistory);
      socket.emit("staffDashboardInactive", { componentId });
    };
  }, [componentId, selectedUserId]);

  useEffect(() => {
    if (selectedUserId) {
      socket.emit("fetchChatHistory", { userId: selectedUserId });
    }
  }, [selectedUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendReply = () => {
    if (!reply.trim() || !selectedUserId) return;
    socket.emit("staffMessage", { userId: selectedUserId, reply });
    setReply("");
  };

  const endSupportAndClose = (userId) => {
    socket.emit("endSupport", { userId });
    onClose();
  };

  const selectUser = (userId) => {
    setSelectedUserId(userId);
  };

  return (
    <div className="h-full flex bg-gray-50 overflow-hidden">
      {/* Left Sidebar - Active Chats */}
      <div className="w-1/4 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">Active Support Chats</h3>
          {!selectedUserId && (
            <button
              onClick={onClose}
              className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
            >
              Close
            </button>
          )}
        </div>
        {activeUsers.length === 0 ? (
          <p className="p-4 text-gray-600">No active chats.</p>
        ) : (
          activeUsers.map((user) => (
            <div
              key={user.userId}
              onClick={() => selectUser(user.userId)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${selectedUserId === user.userId ? 'bg-gray-100' : ''}`}
            >
              <p className="font-semibold">{user.userId}</p>
              <p className="text-sm text-gray-600 truncate">{user.lastMessage?.message || 'No messages yet'}</p>
            </div>
          ))
        )}
      </div>

      {/* Right Side - Chat Window */}
      <div className="w-3/4 flex flex-col">
        {selectedUserId ? (
          <>
            {/* Chat Header */}
            <div className="bg-white p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">Chat with {selectedUserId}</h3>
              <button
                onClick={() => endSupportAndClose(selectedUserId)}
                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
              >
                End Support
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {(chatHistory[selectedUserId] || []).map((msg, i) => (
                <div
                  key={i}
                  className={`mb-4 flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      msg.sender === 'user' ? 'bg-gray-200 text-gray-800' : 'bg-blue-500 text-white'
                    }`}
                  >
                    <p>{msg.message}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t flex items-center">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 p-2 border border-gray-300 rounded-lg outline-none mr-2"
              />
              <button
                onClick={sendReply}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}