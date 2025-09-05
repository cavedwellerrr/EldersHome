import React, { useEffect, useState } from "react";
import axios from "axios";

const ViewStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    role: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch staff members
  const fetchStaff = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffList(response.data);
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchStaff();
  }, [token]);

  // Delete staff
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffList(staffList.filter((s) => s._id !== id));
    } catch (error) {
      console.error("Error deleting staff:", error);
    }
  };

  // Start editing
  const handleEdit = (s) => {
    setEditingStaff(s._id);
    setForm({
      name: s.name,
      username: s.username,
      email: s.email,
      phone: s.phone,
      role: s.role,
    });
    setErrorMsg("");
  };

  // Update staff
  const handleUpdate = async (id) => {
    setSaving(true);
    setErrorMsg("");
    try {
      await axios.put(`http://localhost:5000/api/staff/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingStaff(null);
      fetchStaff();
    } catch (error) {
      if (error.response?.status === 400) {
        setErrorMsg(error.response.data.message);
      } else {
        console.error("Error updating staff:", error);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading staff members...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Staff Members</h2>
          <p className="text-gray-600">Manage your team members and their information</p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 shadow-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errorMsg}
            </div>
          </div>
        )}

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-orange-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Username</th>
                  <th className="px-6 py-4 text-left font-semibold">Email</th>
                  <th className="px-6 py-4 text-left font-semibold">Phone</th>
                  <th className="px-6 py-4 text-left font-semibold">Role</th>
                  <th className="px-6 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((s, index) => (
                  <tr 
                    key={s._id} 
                    className={`border-b border-gray-100 hover:bg-orange-50 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    {editingStaff === s._id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                            placeholder="Enter name"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                            placeholder="Enter username"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                            placeholder="Enter email"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                            placeholder="Enter phone"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                          >
                            <option value="">Select role</option>
                            <option value="admin">Admin</option>
                            <option value="operator">Operator</option>
                            <option value="caretaker">Caretaker</option>
                            <option value="doctor">Doctor</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2 justify-center">
                            <button 
                              onClick={() => handleUpdate(s._id)}
                              disabled={saving}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
                            >
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button 
                              onClick={() => setEditingStaff(null)}
                              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 font-medium shadow-md"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{s.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-700">{s.username}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-700">{s.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-700">{s.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                            s.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            s.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                            s.role === 'caretaker' ? 'bg-green-100 text-green-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {s.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2 justify-center">
                            <button 
                              onClick={() => handleEdit(s)}
                              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 font-medium shadow-md"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(s._id)}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105 font-medium shadow-md"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {staffList.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
              <p className="text-gray-500">Add some staff members to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewStaff;