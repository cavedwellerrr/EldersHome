import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate("/profile");
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || err.message || "Login failed");
    }
  };

  return (


    <div className="min-h-screen flex items-center justify-center bg-base-100 p-6">

      <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-base-200">
        <h2 className="text-2xl font-bold mb-6 text-base-content">Login</h2>
        {error && <p className="text-error mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input input-bordered w-full"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered w-full"
            required
          />
          <button type="submit" className="btn btn-accent mt-2">
            Login
          </button>
        </form>
        <p className="mt-4 text-sm text-base-content">
          Don't have an account?{" "}
          <Link to="/register" className="text-accent hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
