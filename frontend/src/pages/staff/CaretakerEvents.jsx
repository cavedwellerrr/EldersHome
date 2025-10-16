import React, { useEffect, useState } from "react";
import axios from "axios";

const CaretakerEvents = () => {
  const [events, setEvents] = useState([]);
  const [elders, setElders] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedElder, setSelectedElder] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Toast notification helper
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Helper to calculate age
  const calcAge = (dob) => {
    if (!dob) return null;
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
  };
// CSV Export
const exportSummaryToCSV = () => {
  if (events.length === 0) return alert("No events to export!");
  const headers = ["Event Name", "Location", "Date & Time", "Enrolled Elders", "Total Count"];
  const rows = events.map((event) => {
    const enrolledElders = getEnrolledElders(event._id);
    const elderNames = enrolledElders.map((e) => e.fullName).join("; ");
    const count = getEnrollmentCount(event._id);
    return [
      `"${event.title}"`,
      `"${event.location}"`,
      `"${new Date(event.start_time).toLocaleString()}"`,
      `"${elderNames || "No enrollments"}"`,
      count,
    ];
  });
  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "event_enrollment_summary.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};



  // Load events
  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/events", {
        withCredentials: true,
      });
      console.log("Events loaded:", res.data);
      setEvents(res.data.data || []);
    } catch (e) {
      console.error("Failed to load events:", e);
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
      console.log("Elders loaded:", res.data);
      setElders(res.data.elders || []);
    } catch (e) {
      console.error("Failed to load assigned elders:", e);
      setErr("Failed to load assigned elders");
    }
  };

  // Load event enrollments
  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem("staffToken");
      if (!token) return;
      
      const res = await axios.get(
        "http://localhost:5000/api/event-enrollments",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Enrollments loaded:", res.data);
      setEnrollments(res.data.data || res.data.enrollments || []);
    } catch (e) {
      console.error("Failed to load enrollments:", e);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEvents(), fetchElders(), fetchEnrollments()]).finally(() =>
      setLoading(false)
    );
  }, []);

  // Get enrollment count for a specific event
  const getEnrollmentCount = (eventId) => {
    return enrollments.filter((enrollment) => {
      const enrollmentEventId = enrollment.eventId?._id || enrollment.eventId || enrollment.event?._id || enrollment.event;
      return enrollmentEventId === eventId;
    }).length;
  };

  // Get enrolled elders for a specific event
  const getEnrolledElders = (eventId) => {
    const eventEnrollments = enrollments.filter((enrollment) => {
      const enrollmentEventId = enrollment.eventId?._id || enrollment.eventId || enrollment.event?._id || enrollment.event;
      return enrollmentEventId === eventId;
    });

    const enrolledElders = eventEnrollments.map((enrollment) => {
      const elderIdValue = enrollment.elderId?._id || enrollment.elderId || enrollment.elder?._id || enrollment.elder;
      
      if (enrollment.elder && typeof enrollment.elder === 'object' && enrollment.elder.fullName) {
        return { ...enrollment.elder, enrollmentId: enrollment._id };
      }
      
      if (enrollment.elderId && typeof enrollment.elderId === 'object' && enrollment.elderId.fullName) {
        return { ...enrollment.elderId, enrollmentId: enrollment._id };
      }
      
      const elder = elders.find((e) => e._id === elderIdValue);
      return elder ? { ...elder, enrollmentId: enrollment._id } : null;
    }).filter(Boolean);

    return enrolledElders;
  };

  // Check if elder is already enrolled
  const isElderEnrolled = (eventId, elderId) => {
    return enrollments.some((enrollment) => {
      const enrollmentEventId = enrollment.eventId?._id || enrollment.eventId || enrollment.event?._id || enrollment.event;
      const enrollmentElderId = enrollment.elderId?._id || enrollment.elderId || enrollment.elder?._id || enrollment.elder;
      return enrollmentEventId === eventId && enrollmentElderId === elderId;
    });
  };

  // Enroll elder to event
  const handleEnroll = async (eventId) => {
    if (!selectedElder) {
      showToast("Please select an elder first!", "error");
      return;
    }

    if (isElderEnrolled(eventId, selectedElder)) {
      showToast("This elder is already enrolled in this event!", "error");
      return;
    }

    try {
      const token = localStorage.getItem("staffToken");
      if (!token) {
        showToast("Not authorized. Please log in again.", "error");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/event-enrollments",
        { eventId, elderId: selectedElder },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Enrollment response:", response.data);
      showToast("Elder enrolled successfully! 🎉", "success");
      
      await fetchEnrollments();
    } catch (e) {
      console.error("Enrollment error:", e);
      showToast("Enrollment failed: " + (e.response?.data?.message || e.message), "error");
    }
  };

  // Unenroll elder from event
  const handleUnenroll = async (enrollmentId, elderName) => {
    if (!window.confirm(`Are you sure you want to unenroll ${elderName} from this event?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("staffToken");
      if (!token) {
        showToast("Not authorized. Please log in again.", "error");
        return;
      }

      await axios.delete(
        `http://localhost:5000/api/event-enrollments/${enrollmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showToast(`${elderName} has been unenrolled successfully! ✅`, "success");
      
      await fetchEnrollments();
    } catch (e) {
      console.error("Unenrollment error:", e);
      showToast("Failed to unenroll: " + (e.response?.data?.message || e.message), "error");
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
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`rounded-xl shadow-2xl border-2 p-4 min-w-[300px] ${
            toast.type === "success" 
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300" 
              : "bg-gradient-to-r from-red-50 to-rose-50 border-red-300"
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`rounded-full p-2 ${
                toast.type === "success" ? "bg-green-100" : "bg-red-100"
              }`}>
                <span className="text-xl">
                  {toast.type === "success" ? "✅" : "❌"}
                </span>
              </div>
              <p className={`font-medium ${
                toast.type === "success" ? "text-green-800" : "text-red-800"
              }`}>
                {toast.message}
              </p>
            </div>
          </div>
        </div>
      )}

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
        <div className="space-y-6 mb-12">
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
              {events.map((event) => {
                const enrolledElders = getEnrolledElders(event._id);
                const enrollmentCount = getEnrollmentCount(event._id);
                const isExpanded = expandedEvent === event._id;
                const alreadyEnrolled = selectedElder && isElderEnrolled(event._id, selectedElder);

                return (
                  <div
                    key={event._id}
                    className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden transform hover:scale-[1.01] transition-all duration-300 hover:shadow-2xl"
                  >
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                          {event.title}
                        </h2>
                        <div className="flex items-center gap-2">
                          <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                            {enrollmentCount} Enrolled
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="grid md:grid-cols-3 gap-4 mb-6">
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

                      {/* Enrolled Elders Section */}
                      {enrolledElders.length > 0 && (
                        <div className="mb-6">
                          <button
                            onClick={() => setExpandedEvent(isExpanded ? null : event._id)}
                            className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200 transition-colors duration-200"
                          >
                            <div className="flex items-center">
                              <svg className="w-5 h-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                              </svg>
                              <span className="font-semibold text-orange-700">
                                {enrolledElders.length} Elder{enrolledElders.length !== 1 ? 's' : ''} Enrolled
                              </span>
                            </div>
                            <svg
                              className={`w-5 h-5 text-orange-600 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                            </svg>
                          </button>

                          {isExpanded && (
                            <div className="mt-4 overflow-x-auto rounded-xl border border-orange-200">
                              <table className="min-w-full text-sm">
                                <thead className="bg-orange-50">
                                  <tr>
                                    <th className="text-left px-6 py-3 font-semibold text-orange-700">Name</th>
                                    <th className="text-center px-6 py-3 font-semibold text-orange-700">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {enrolledElders.map((elder, idx) => (
                                    <tr key={elder._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-orange-50/30'}>
                                      <td className="px-6 py-4 font-medium text-gray-800 text-base">{elder?.fullName || "Unknown Elder"}</td>
                                      <td className="px-6 py-4 text-center">
                                        <button
                                          onClick={() => handleUnenroll(elder.enrollmentId, elder?.fullName)}
                                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md"
                                        >
                                          Unenroll
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => handleEnroll(event._id)}
                        disabled={!selectedElder || alreadyEnrolled}
                        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg ${
                          alreadyEnrolled
                            ? 'bg-green-100 text-green-700 cursor-not-allowed border-2 border-green-300'
                            : selectedElder
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-200 hover:shadow-orange-300'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-center">
                          {alreadyEnrolled ? (
                            <>
                              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                              </svg>
                              Already Enrolled
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                              </svg>
                              {selectedElder ? 'Enroll Selected Elder' : 'Select an Elder First'}
                            </>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Enrollment Summary Table */}
        {events.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <h2 className="text-2xl font-semibold text-white flex items-center">
                <svg className="w-7 h-7 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
                </svg>
                📊 Enrollment Summary - All Events
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-orange-50 border-b-2 border-orange-200">
                  <tr>
                    <th className="text-left px-6 py-4 font-semibold text-orange-700 text-sm uppercase tracking-wider">Event Name</th>
                    <th className="text-left px-6 py-4 font-semibold text-orange-700 text-sm uppercase tracking-wider">Location</th>
                    <th className="text-left px-6 py-4 font-semibold text-orange-700 text-sm uppercase tracking-wider">Date & Time</th>
                    <th className="text-left px-6 py-4 font-semibold text-orange-700 text-sm uppercase tracking-wider">Enrolled Elders</th>
                    <th className="text-center px-6 py-4 font-semibold text-orange-700 text-sm uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100">
                  {events.map((event, idx) => {
                    const enrolledElders = getEnrolledElders(event._id);
                    const count = getEnrollmentCount(event._id);
                    
                    return (
                      <tr key={event._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-orange-50/20 hover:bg-orange-50/40'}>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-800 text-base">{event.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                            </svg>
                            {event.location}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-gray-600 text-sm">
                            <svg className="w-4 h-4 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                            </svg>
                            {new Date(event.start_time).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {enrolledElders.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {enrolledElders.map((elder) => (
                                <span
                                  key={elder._id}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700 border border-orange-200"
                                >
                                  {elder?.fullName || "Unknown"}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">No enrollments yet</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                            count > 0 
                              ? 'bg-orange-500 text-white shadow-lg' 
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            {count}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Total Summary Footer */}
            <div className="bg-gradient-to-r from-orange-100 to-orange-50 border-t-2 border-orange-300 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-full p-3 mr-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-orange-600 font-medium uppercase tracking-wide">Total Enrollments</p>
                    <p className="text-2xl font-bold text-orange-800">Across All Events</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl px-8 py-4 shadow-2xl transform hover:scale-105 transition-transform">
                  <p className="text-5xl font-extrabold text-white">
                    {enrollments.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Enrollment Summary Table */}
{events.length > 0 && (
  <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex justify-between items-center">
      

      {/* Download Buttons */}
      <div className="flex gap-2">
        <button
          onClick={exportSummaryToCSV}
          className="px-4 py-2 bg-emerald-400 hover:bg-orange-500 text-white font-medium rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          📄 Export CSV
        </button>

      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-full">
        {/* ... your existing table code ... */}
      </table>
    </div>
  </div>
)}


      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CaretakerEvents;