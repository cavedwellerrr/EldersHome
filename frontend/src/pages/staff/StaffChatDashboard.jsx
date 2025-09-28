import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function StaffDashboard() {
  const [requests, setRequests] = useState([]);
  const [reply, setReply] = useState("");

  useEffect(() => {
    socket.on("supportRequest", (data) => {
      setRequests((prev) => [...prev, data]);
    });

    return () => {
      socket.off("supportRequest");
    };
  }, []);

  const sendReply = (userId) => {
    socket.emit("staffMessage", { userId, reply });
    setReply("");
  };

  return (
    <div>
      <h2>Support Requests</h2>
      {requests.map((req, i) => (
        <div key={i}>
          <p><b>{req.userId}</b>: {req.message}</p>
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Reply here..."
          />
          <button onClick={() => sendReply(req.userId)}>Send</button>
          <button onClick={() => socket.emit("endSupport", { userId: req.userId })}>
  End Support
</button>

        </div>
      ))}
    </div>
  );
}
