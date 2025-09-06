import React, { useEffect, useState } from "react";
import axios from "axios";

const CaretakerEvents = () => {
  const [events, setEvents] = useState([]);
  const [elders, setElders] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedElder, setSelectedElder] = useState("");

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/events", {
        withCredentials: true,
      });
      setEvents(res.data.data);
    } catch (err) {
      console.error("Error fetching events:", err.response?.data || err.message);
    }
  };

  const fetchElders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/elders", {
        withCredentials: true,
      });
      setElders(res.data.data);
    } catch (err) {
      console.error("Error fetching elders:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchElders();
  }, []);

  const openEnrollForm = (event) => {
    setSelectedEvent(event);
    setSelectedElder("");
  };

  const closeEnrollForm = () => {
    setSelectedEvent(null);
    setSelectedElder("");
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/event-enrollments",
        { eventId: selectedEvent._id, elderId: selectedElder },
        { withCredentials: true }
      );
      alert("✅ Elder successfully enrolled!");
      closeEnrollForm();
    } catch (err) {
      console.error("Error enrolling:", err.response?.data || err.message);
      alert("❌ Enrollment failed. Try again!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8">
      <h1 className="text-4xl font-bold mb-10 text-blue-900 text-center">
        🌟 Caretaker Events
      </h1>

      {events.length === 0 ? (
        <p className="text-gray-500 text-center">No events available.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <li
              key={event._id}
              className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition transform hover:-translate-y-1"
            >
              <h2 className="text-2xl font-semibold text-blue-900 mb-3">
                {event.title}
              </h2>
              <p className="text-gray-600 mb-3">{event.description}</p>

              <p className="text-gray-700 mb-1">
                <span className="text-orange-500 font-semibold">📍 Location:</span> {event.location}
              </p>
              <p className="text-gray-700 mb-1">
                <span className="text-green-600 font-semibold">⏰ Start:</span> {new Date(event.start_time).toLocaleString()}
              </p>
              <p className="text-gray-700">
                <span className="text-red-500 font-semibold">⏰ End:</span> {new Date(event.end_time).toLocaleString()}
              </p>

              <div className="mt-6 text-center">
                <button
                  onClick={() => openEnrollForm(event)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-full shadow-md transition"
                >
                  ✅ Enroll
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-96">
            <h2 className="text-2xl font-bold mb-6 text-blue-900 text-center">
              Enroll Elder to {selectedEvent.title}
            </h2>

            <form onSubmit={handleEnroll} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Select Elder:
                </label>
                <select
                  value={selectedElder}
                  onChange={(e) => setSelectedElder(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-400"
                  required
                >
                  <option value="">-- Choose Elder --</option>
                  {elders.map((elder) => (
                    <option key={elder._id} value={elder._id}>
                      {elder.name} ({elder.age} yrs)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEnrollForm}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg transition"
                >
                  Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaretakerEvents;
