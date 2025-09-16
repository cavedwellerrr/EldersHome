import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch enrollments
  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem("staffToken");
      const res = await axios.get("http://localhost:5000/api/event-enrollments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnrollments(res.data.data || []);
    } catch (error) {
      setErr(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete an enrollment
  const deleteEnrollment = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this enrollment?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("staffToken");
      await axios.delete(`http://localhost:5000/api/event-enrollments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove the deleted enrollment from UI
      setEnrollments((prev) => prev.filter((e) => e._id !== id));
      setSuccessMsg("Enrollment deleted successfully ✅");

      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      setErr(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  if (loading) return <div className="p-4">Loading…</div>;
  if (err) return <div className="p-4 text-red-600">{err}</div>;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">📋 Event Enrollments</h1>

      {successMsg && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
          {successMsg}
        </div>
      )}

      {enrollments.length === 0 ? (
        <p className="text-gray-500">No enrollments found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full border-collapse">
            <thead className="bg-orange-500 text-white">
              <tr>
                <th className="px-4 py-2 border">Event</th>
                <th className="px-4 py-2 border">Elder</th>
                <th className="px-4 py-2 border">Enrolled At</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enroll) => (
                <tr key={enroll._id} className="text-gray-700 text-center">
                  <td className="px-4 py-2 border">{enroll.event?.title || "—"}</td>
                  <td className="px-4 py-2 border">{enroll.elder?.fullName || "—"}</td>
                  <td className="px-4 py-2 border">
                    {new Date(enroll.enrolledAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => deleteEnrollment(enroll._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminEnrollments;