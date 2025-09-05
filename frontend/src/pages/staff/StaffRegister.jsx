import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StaffRegister = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("staffToken");
      if (!token) {
        setError("Unauthorized: No token found");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/register`,
        { name, username, email, phone, password, role, specialization },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(`Staff ${response.data.name} registered successfully!`);

      setName("");
      setUsername("");
      setEmail("");
      setPhone("");
      setPassword("");
      setRole("");
      setSpecialization(""); 
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ maxWidth: "500px" }}>
      <h2>Register New Staff</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleRegister}>
        <div>
          <label>Name:</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Username:</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Phone:</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="operator">Operator</option>
            <option value="caretaker">Caretaker</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>

        {role === "doctor" && (
          <div>
            <label>Specialization:</label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              required
            />
          </div>
        )}

        <button type="submit">Register Staff</button>
      </form>
    </div>
  );
};

export default StaffRegister;
