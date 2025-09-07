import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <h1 className="text-3xl font-bold mb-6 text-orange-600">⚡ Admin Events</h1>
  
    <button
    onClick={() => navigate("/staff/admin-dashboard/enrollments")}
    className="mb-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow transition"
  >
    🎓 Go to Event Enrollments
  </button>
      
      {/* Download CSV Button */}
      <button
        onClick={exportToCSV}
        className="mb-6 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg shadow-md transition"
      >
        📥 Download Events CSV
      </button>

      {/* Create Event Form */}
      <div className="mb-8 border border-orange-200 p-6 rounded-lg shadow bg-white">
        <h2 className="text-xl font-semibold mb-4 text-orange-600">➕ Add New Event</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border border-gray-300 bg-white p-2 rounded focus:ring-2 focus:ring-orange-400"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 bg-white p-2 rounded focus:ring-2 focus:ring-orange-400"
            required
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border border-gray-300 bg-white p-2 rounded focus:ring-2 focus:ring-orange-400"
            required
          />
          <input
            type="datetime-local"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            className="w-full border border-gray-300 bg-white p-2 rounded focus:ring-2 focus:ring-orange-400"
            required
          />
          <input
            type="datetime-local"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            className="w-full border border-gray-300 bg-white p-2 rounded focus:ring-2 focus:ring-orange-400"
            required
          />
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
          >
            Create Event
          </button>
        </form>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <p className="text-gray-500">No events found.</p>
      ) : (
        <ul className="space-y-4">
          {events.map((event) => (
            <li key={event._id} className="border border-orange-200 p-5 rounded-lg shadow bg-white">
              {editingEvent === event._id ? (
                // Edit Mode
                <form onSubmit={handleUpdate} className="space-y-2">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full border border-gray-300 bg-white p-2 rounded focus:ring-2 focus:ring-orange-400"
                  />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border border-gray-300 bg-white p-2 rounded focus:ring-2 focus:ring-orange-400"
                  />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full border border-gray-300 bg-white p-2 rounded focus:ring-2 focus:ring-orange-400"
                  />
                  <input
                    type="datetime-local"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="w-full border border-gray-300 bg-white p-2 rounded focus:ring-2 focus:ring-orange-400"
                  />
                  <input
                    type="datetime-local"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className="w-full border border-gray-300 bg-white p-2 rounded focus:ring-2 focus:ring-orange-400"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingEvent(null)}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // View Mode
                <>
                  <h2 className="text-xl font-semibold text-orange-600">{event.title}</h2>
                  <p className="text-gray-700">{event.description}</p>
                  <p><span className="text-orange-500 font-semibold">📍 Location:</span> {event.location}</p>
                  <p><span className="text-orange-500 font-semibold">⏰ Start:</span> {new Date(event.start_time).toLocaleString()}</p>
                  <p><span className="text-orange-500 font-semibold">⏰ End:</span> {new Date(event.end_time).toLocaleString()}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(event)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


export default AdminEvents;