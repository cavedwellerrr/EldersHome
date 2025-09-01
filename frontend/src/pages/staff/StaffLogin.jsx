import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api"; // your axios instance

const StaffLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await api.post("/staff/login", { username, password });

    // Save credentials
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.role);
    localStorage.setItem("username", res.data.username);

    // ✅ Redirect by role
    switch (res.data.role) {
      case "admin":
        navigate("/staff/admin-dashboard");
        break;
      case "operator":
        navigate("/staff/operator-dashboard");
        break;
      case "caretaker":
        navigate("/staff/caretaker-dashboard");
        break;
      case "doctor":
        navigate("/staff/doctor-dashboard");
        break;
      default:
        navigate("/login"); // fallback
    }
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || "Login failed");
  }
};

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Staff Login</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default StaffLogin;
