import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StaffLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        { username, password }
      );

      const { token, role, name } = response.data;

      // Store token based on role
      if (role === "Admin") {
        localStorage.setItem("adminToken", token);
        navigate("/admin-dashboard");
      } else if (role === "Operator") {
        localStorage.setItem("staffToken", token);
        navigate("/operator-dashboard");
      } else if (role === "Caretaker") {
        localStorage.setItem("staffToken", token);
        navigate("/caretaker-dashboard");
      } else if (role === "Doctor") {
        localStorage.setItem("staffToken", token);
        navigate("/doctor-dashboard");
      } else {
        localStorage.setItem("staffToken", token);
        navigate("/");
      }

      localStorage.setItem("staffRole", role);
      localStorage.setItem("staffName", name);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Staff Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default StaffLogin;
