import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    start_time: "",
    end_time: "",
  });

  const navigate = useNavigate();

  // Fetch all events
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

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create new event
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/events", formData, {
        withCredentials: true,
      });
      setFormData({
        title: "",
        description: "",
        location: "",
        start_time: "",
        end_time: "",
      });
      fetchEvents();
    } catch (err) {
      console.error("Error creating event:", err.response?.data || err.message);
    }
  };

  // Delete Event
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/events/${id}`, {
        withCredentials: true,
      });
      setEvents(events.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Error deleting event:", err.response?.data || err.message);
    }
  };

  // Start editing
  const handleEdit = (event) => {
    setEditingEvent(event._id);
    setFormData({
      title: event.title,
      description: event.description,
      location: event.location,
      start_time: event.start_time.slice(0, 16),
      end_time: event.end_time.slice(0, 16),
    });
  };

  // Update event
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/events/${editingEvent}`,
        formData,
        { withCredentials: true }
      );
      setEditingEvent(null);
      fetchEvents();
    } catch (err) {
      console.error("Error updating event:", err.response?.data || err.message);
    }
  };

  // Export CSV
  const exportToCSV = () => {
    if (events.length === 0) {
      alert("No events to export!");
      return;
    }

    const headers = ["Title", "Description", "Location", "Start Time", "End Time"];
    const rows = events.map((event) => [
      `"${event.title}"`,
      `"${event.description}"`,
      `"${event.location}"`,
      `"${new Date(event.start_time).toLocaleString()}"`,
      `"${new Date(event.end_time).toLocaleString()}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "events.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download PDF
  const downloadEventListPDF = () => {
    if (events.length === 0) {
      alert("No events to export!");
      return;
    }

    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Event List", 14, 20);

      if (!doc.autoTable) {
        throw new Error("autoTable plugin not loaded");
      }

      const tableColumn = ["#", "Title", "Location", "Start Time", "End Time"];
      const tableRows = events.map((event, index) => [
        index + 1,
        event.title,
        event.location,
        new Date(event.start_time).toLocaleDateString(),
        new Date(event.end_time).toLocaleDateString(),
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: {
          fontSize: 10
        },
        headStyles: {
          fillColor: [245, 101, 57],
          textColor: 255
        }, // Orange color
        alternateRowStyles: {
          fillColor: [255, 247, 237]
        }, // Light orange
      });

      doc.save("event_list.pdf");
    } catch (err) {
      console.error("PDF generation error:", err);
      alert(`Error generating PDF: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Header Section with Total Events Display */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <span className="text-5xl">⚡</span>
              Admin Events
            </h1>
            <p className="text-gray-600 text-lg">Manage and organize your events seamlessly</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4 border border-orange-200">
            <p className="text-gray-800 font-semibold text-lg">{events.length} Events</p>
            <p className="text-gray-500 text-sm">Total managed</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => navigate("/staff/admin-dashboard/enrollments")}
            className="group bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">🎓</span>
            Go to Event Enrollments
          </button>
          
          <button
            onClick={exportToCSV}
            className="group bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">📥</span>
            Download Events CSV
          </button>

          <button
            onClick={downloadEventListPDF}
            className="group bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">📄</span>
            Download Events PDF
          </button>
        </div>

        {/* Create Event Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">➕</span>
              Add New Event
            </h2>
            <p className="text-orange-100 mt-1">Create amazing events for your community</p>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleCreate} className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">Event Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter event title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border-2 border-orange-200 bg-white p-4 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-400 transition-all duration-300 text-gray-700 placeholder-gray-400"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  name="description"
                  placeholder="Describe your event..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border-2 border-orange-200 bg-white p-4 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-400 transition-all duration-300 text-gray-700 placeholder-gray-400 resize-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Event location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full border-2 border-orange-200 bg-white p-4 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-400 transition-all duration-300 text-gray-700 placeholder-gray-400"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className="w-full border-2 border-orange-200 bg-white p-4 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-400 transition-all duration-300 text-gray-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">End Time</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="w-full border-2 border-orange-200 bg-white p-4 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-400 transition-all duration-300 text-gray-700"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="group bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
                >
                  <span className="group-hover:scale-110 transition-transform">✨</span>
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {events.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-500 text-xl font-medium">No events found</p>
              <p className="text-gray-400 mt-2">Create your first event to get started!</p>
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-orange-500">📋</span>
                Your Events ({events.length})
              </h3>
              
              <div className="grid gap-6">
                {events.map((event) => (
                  <div key={event._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl border border-orange-100 overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
                    {editingEvent === event._id ? (
                      // Edit Mode
                      <div>
                        <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-8 py-4">
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-2xl">✏️</span>
                            Editing Event
                          </h3>
                        </div>
                        
                        <div className="p-8">
                          <form onSubmit={handleUpdate} className="grid md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                              <label className="block text-gray-700 font-semibold mb-2">Title</label>
                              <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full border-2 border-orange-200 bg-white p-3 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-400 transition-all duration-300"
                              />
                            </div>
                            
                            <div className="md:col-span-2">
                              <label className="block text-gray-700 font-semibold mb-2">Description</label>
                              <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full border-2 border-orange-200 bg-white p-3 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-400 transition-all duration-300 resize-none"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-gray-700 font-semibold mb-2">Location</label>
                              <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full border-2 border-orange-200 bg-white p-3 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-400 transition-all duration-300"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-gray-700 font-semibold mb-2">Start Time</label>
                              <input
                                type="datetime-local"
                                name="start_time"
                                value={formData.start_time}
                                onChange={handleChange}
                                className="w-full border-2 border-orange-200 bg-white p-3 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-400 transition-all duration-300"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-gray-700 font-semibold mb-2">End Time</label>
                              <input
                                type="datetime-local"
                                name="end_time"
                                value={formData.end_time}
                                onChange={handleChange}
                                className="w-full border-2 border-orange-200 bg-white p-3 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-400 transition-all duration-300"
                              />
                            </div>
                            
                            <div className="md:col-span-2 flex gap-4">
                              <button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                              >
                                💾 Save Changes
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingEvent(null)}
                                className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                              >
                                ❌ Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div>
                        <div className="bg-gradient-to-r from-orange-500 to-orange-400 p-6">
                          <h2 className="text-2xl font-bold text-white mb-2">{event.title}</h2>
                          <div className="flex items-center gap-2 text-orange-100">
                            <span>📅</span>
                            <span>{new Date(event.start_time).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="p-8">
                          <div className="space-y-4 mb-6">
                            <p className="text-gray-700 text-lg leading-relaxed">{event.description}</p>
                            
                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="bg-orange-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-orange-600 font-semibold mb-1">
                                  <span className="text-lg">📍</span>
                                  Location
                                </div>
                                <p className="text-gray-700">{event.location}</p>
                              </div>
                              
                              <div className="bg-orange-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-orange-600 font-semibold mb-1">
                                  <span className="text-lg">⏰</span>
                                  Start Time
                                </div>
                                <p className="text-gray-700 text-sm">
                                  {new Date(event.start_time).toLocaleString()}
                                </p>
                              </div>
                              
                              <div className="bg-orange-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-orange-600 font-semibold mb-1">
                                  <span className="text-lg">⏰</span>
                                  End Time
                                </div>
                                <p className="text-gray-700 text-sm">
                                  {new Date(event.end_time).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-4">
                            <button
                              onClick={() => handleEdit(event)}
                              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                            >
                              <span className="text-lg">✏️</span>
                              Edit Event
                            </button>
                            <button
                              onClick={() => handleDelete(event._id)}
                              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                            >
                              <span className="text-lg">🗑️</span>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;