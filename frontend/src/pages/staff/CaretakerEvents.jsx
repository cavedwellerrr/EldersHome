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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 text-lg font-medium">Loading events...</p>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="bg-white border-l-4 border-red-500 shadow-lg rounded-lg p-6 max-w-md mx-4">
          <div className="flex items-center">
            <div className="text-red-500 mr-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
              </svg>
            </div>
            <p className="text-red-700 font-medium">{err}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mb-6 shadow-lg">
            <span className="text-3xl">🎉</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-2">
            Caretaker Events
          </h1>
          <p className="text-gray-600 text-lg">Manage and enroll elders in upcoming events</p>
        </div>

        {/* Elder Selector */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                </svg>
                Select Elder to Enroll
              </h2>
            </div>
            <div className="p-6">
              <select
                className="w-full border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 p-4 rounded-xl text-gray-700 font-medium transition-all duration-200 bg-white hover:border-orange-300"
                value={selectedElder}
                onChange={(e) => setSelectedElder(e.target.value)}
              >
                <option value="">-- Choose an Elder --</option>
                {elders.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.fullName} (Room {e?.room?.room_id || "—"})
                  </option>
                ))}
              </select>
              {selectedElder && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-700 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    Elder selected! You can now enroll them in events below.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {events.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No events found.</p>
              <p className="text-gray-400 text-sm mt-1">Check back later for upcoming events!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {events.map((event, index) => (
                <div
                  key={event._id}
                  className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden transform hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                        {event.title}
                      </h2>
                      <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                        Event
                      </div>
                    </div>

                    <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                      <div className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                        <div className="bg-orange-500 rounded-full p-2 mr-3">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-orange-600 font-medium">Location</p>
                          <p className="text-gray-800 font-semibold">{event.location}</p>
                        </div>
                      </div>

                      <div className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                        <div className="bg-orange-500 rounded-full p-2 mr-3">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-orange-600 font-medium">Start Time</p>
                          <p className="text-gray-800 font-semibold text-sm">
                            {new Date(event.start_time).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                        <div className="bg-orange-500 rounded-full p-2 mr-3">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-orange-600 font-medium">End Time</p>
                          <p className="text-gray-800 font-semibold text-sm">
                            {new Date(event.end_time).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleEnroll(event._id)}
                      disabled={!selectedElder}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg ${
                        selectedElder
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-200 hover:shadow-orange-300'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                        {selectedElder ? 'Enroll Selected Elder' : 'Select an Elder First'}
                      </div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CaretakerEvents;