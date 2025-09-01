import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  // Redirect if no token
  useEffect(() => {
    if (!token) navigate("/staff-login");
  }, [token, navigate]);

  // Fetch staff members
  const fetchStaff = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffList(response.data);
    } catch (error) {
      console.error("Error fetching staff:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/staff-login");
      }
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
      if (error.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/staff-login");
      }
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
      } else if (error.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/staff-login");
      } else {
        console.error("Error updating staff:", error);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-5">Loading staff members...</p>;

  return (
    <div>
      <h2>Staff Members</h2>

      {/* Basic HTML table */}
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {staffList.map((s) => (
            <tr key={s._id}>
              {editingStaff === s._id ? (
                <>
                  <td>
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={form.username}
                      onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={form.role}
                      onChange={(e) =>
                        setForm({ ...form, role: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <button onClick={() => handleUpdate(s._id)}>Save</button>
                    <button onClick={() => setEditingStaff(null)}>
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{s.name}</td>
                  <td>{s.username}</td>
                  <td>{s.email}</td>
                  <td>{s.phone}</td>
                  <td>{s.role}</td>
                  <td>
                    <button onClick={() => handleEdit(s)}>Edit</button>
                    <button onClick={() => handleDelete(s._id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewStaff;
