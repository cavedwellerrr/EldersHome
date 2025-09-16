import React, { useEffect, useState } from "react";
import axios from "axios";

const CaretakerEvents = () => {
  const [events, setEvents] = useState([]);
  const [elders, setElders] = useState([]);
  const [selectedElder, setSelectedElder] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Load events
  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/events", {
        withCredentials: true,
      });
      setEvents(res.data.data || []);
    } catch (e) {
      setErr("Failed to load events");
    }
  };

  // Load assigned elders
  const fetchElders = async () => {
    try {
      const token = localStorage.getItem("staffToken");
      if (!token) {
        setErr("Please log in as staff/caretaker first.");
        return;
      }
      const res = await axios.get(
        "http://localhost:5000/api/caretaker/elders/my",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setElders(res.data.elders || []);
    } catch (e) {
      setErr("Failed to load assigned elders");
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEvents(), fetchElders()]).finally(() =>
      setLoading(false)
    );
  }, []);

  // ✅ Enroll elder to event (with staff token)
  const handleEnroll = async (eventId) => {
    if (!selectedElder) {
      alert("Please select an elder first!");
      return;
    }
    try {
      const token = localStorage.getItem("staffToken");
      if (!token) {
        alert("Not authorized. Please log in again.");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/event-enrollments",
        { eventId, elderId: selectedElder },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Elder enrolled successfully!");
    } catch (e) {
      alert("Enrollment failed: " + (e.response?.data?.message || e.message));
    }
  };

  if (loading) return <div className="p-4">Loading…</div>;
  if (err) return <div className="p-4 text-red-600">{err}</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-orange-600">🎉 Caretaker Events</h1>

      {/* Elder Selector */}
      <div className="p-4 border rounded bg-white shadow">
        <h2 className="font-semibold mb-2">Select Elder to Enroll</h2>
        <select
          className="w-full border p-2 rounded"
          value={selectedElder}
          onChange={(e) => setSelectedElder(e.target.value)}
        >
          <option value="">-- Choose Elder --</option>
          {elders.map((e) => (
            <option key={e._id} value={e._id}>
              {e.fullName} (Room {e?.room?.room_id || "—"})
            </option>
          ))}
        </select>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          events.map((event) => (
            <div
              key={event._id}
              className="p-5 border rounded-lg shadow bg-white"
            >
              <h2 className="text-lg font-semibold text-orange-600">
                {event.title}
              </h2>
              <p className="text-gray-700">{event.description}</p>
              <p>
                <span className="font-medium">📍 Location:</span>{" "}
                {event.location}
              </p>
              <p>
                <span className="font-medium">⏰ Start:</span>{" "}
                {new Date(event.start_time).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">⏰ End:</span>{" "}
                {new Date(event.end_time).toLocaleString()}
              </p>

              <button
                onClick={() => handleEnroll(event._id)}
                className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
              >
                ✅ Enroll Selected Elder
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CaretakerEvents;