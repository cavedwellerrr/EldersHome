// src/pages/staff/StaffChatDashboard.jsx
import React, { useState, useEffect } from "react";
import { socket } from "../../utils/socket"; // Adjust path if needed
import { v4 as uuidv4 } from "uuid";

export default function StaffChatDashboard() {
  const [requests, setRequests] = useState([]);
  const [reply, setReply] = useState("");
  const componentId = React.useMemo(() => {
    try {
      return uuidv4();
    } catch (error) {
      console.error("Failed to generate UUID:", error);
      return `fallback-id-${Date.now()}`;
    }
  }, []);

  useEffect(() => {
    const handleSupportRequest = (data) => {
      console.log(`Received support request for component ${componentId}:`, data);
      setRequests((prev) => {
        if (prev.some((req) => req.userId === data.userId && req.message === data.message)) {
          console.log("Duplicate message detected, skipping:", data);
          return prev;
        }
        return [...prev, data];
      });
      socket.emit("messageViewed", { userId: data.userId });
    };

    const handleEndSupport = ({ userId }) => {
      console.log(`Received endSupport for user ${userId} on component ${componentId}`);
      setRequests((prev) => prev.filter((req) => req.userId !== userId));
    };

    socket.on(`supportRequest-${componentId}`, handleSupportRequest);
    socket.on(`endSupport-${componentId}`, handleEndSupport);
    socket.emit("staffDashboardActive", { componentId });

    return () => {
      console.log(`Cleaning up listeners for component ${componentId}`);
      socket.off(`supportRequest-${componentId}`, handleSupportRequest);
      socket.off(`endSupport-${componentId}`, handleEndSupport);
      socket.emit("staffDashboardInactive", { componentId });
    };
  }, [componentId]);

  const sendReply = (userId) => {
    if (!reply.trim()) {
      console.log("Empty reply, not sending");
      return;
    }
    socket.emit("staffMessage", { userId, reply });
    setReply("");
    console.log(`Sent reply to user ${userId}: ${reply}`);
  };

  const endSupport = (userId) => {
    socket.emit("endSupport", { userId });
    console.log(`Ended support for user ${userId}`);
  };

  return (
    <div className="h-full bg-gray-50 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Support Requests</h2>
        {requests.length === 0 ? (
          <p className="text-gray-600">No active support requests.</p>
        ) : (
          requests.map((req, i) => (
            <div key={`${req.userId}-${i}`} className="bg-white rounded-lg shadow-md p-4 mb-4">
              <p className="text-gray-800">
                <b>{req.userId}</b>: {req.message}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Reply here..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg outline-none"
                />
                <button
                  onClick={() => sendReply(req.userId)}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                >
                  Send
                </button>
                <button
                  onClick={() => endSupport(req.userId)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  End Support
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}