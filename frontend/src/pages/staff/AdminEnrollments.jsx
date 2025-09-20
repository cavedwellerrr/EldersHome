import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState(""); // search input state
  const [filtered, setFiltered] = useState([]); // filtered enrollments

  // Fetch enrollments
  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem("staffToken");
      const res = await axios.get("http://localhost:5000/api/event-enrollments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnrollments(res.data.data || []);
      setFiltered(res.data.data || []); // initially show all
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
      setFiltered((prev) => prev.filter((e) => e._id !== id));
      setSuccessMsg("Enrollment deleted successfully ✅");

      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      setErr(error.response?.data?.message || error.message);
    }
  };

  // Handle search
  const handleSearch = () => {
    const query = search.toLowerCase();
    const results = enrollments.filter(
      (enroll) =>
        enroll.event?.title?.toLowerCase().includes(query) ||
        enroll.elder?.fullName?.toLowerCase().includes(query)
    );
    setFiltered(results);
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-orange-100">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-200 border-t-orange-500"></div>
          <span className="text-orange-700 text-lg font-medium">Loading enrollments...</span>
        </div>
      </div>
    </div>
  );

  if (err) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-lg max-w-md">
        <div className="flex items-center">
          <div className="text-red-500 text-2xl mr-3">⚠️</div>
          <div>
            <h3 className="text-red-800 font-semibold">Error</h3>
            <p className="text-red-700">{err}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-orange-500 p-3 rounded-xl shadow-lg">
              <span className="text-white text-2xl">📋</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              Event Enrollments
            </h1>
          </div>
          <p className="text-orange-700/70 text-lg">Manage and monitor all event enrollments</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex items-center space-x-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Event or Elder..."
            className="px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-orange-400 focus:outline-none flex-1"
          />
          <button
            onClick={handleSearch}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-medium shadow-md transition-all"
          >
            Search
          </button>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="mb-6 transform transition-all duration-300 ease-in-out">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <span className="text-green-600 text-lg">✅</span>
                </div>
                <span className="text-green-800 font-medium">{successMsg}</span>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-12 text-center">
            <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-orange-500 text-3xl">📝</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Enrollments Found</h3>
            <p className="text-gray-500">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
            {/* Stats Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold text-lg">
                  Total Enrollments: {filtered.length}
                </h2>
                <div className="bg-white/20 px-3 py-1 rounded-full">
                  <span className="text-white text-sm font-medium">Active</span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-orange-100 to-orange-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider border-b border-orange-200">
                      Event
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider border-b border-orange-200">
                      Elder
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider border-b border-orange-200">
                      Enrolled At
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-orange-800 uppercase tracking-wider border-b border-orange-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((enroll, index) => (
                    <tr 
                      key={enroll._id} 
                      className={`hover:bg-orange-25 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-orange-100 p-2 rounded-lg mr-3">
                            <span className="text-orange-600 text-sm">🎯</span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {enroll.event?.title || "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-orange-100 p-2 rounded-full mr-3">
                            <span className="text-orange-600 text-sm">👤</span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {enroll.elder?.fullName || "—"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center">
                          <div className="bg-gray-100 p-2 rounded-lg mr-3">
                            <span className="text-gray-600 text-xs">📅</span>
                          </div>
                          {new Date(enroll.enrolledAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => deleteEnrollment(enroll._id)}
                          className="group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                        >
                          <span className="flex items-center space-x-2">
                            <span>Delete</span>
                            <span className="group-hover:animate-pulse">❌</span>
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEnrollments;