import React, { createContext, useState, useEffect } from "react";
import api from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null); // Stores logged-in guardian info
  const [loading, setLoading] = useState(true);

  // Check if guardian is logged in on app load
  const fetchGuardian = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Set the token in the default headers for all api requests
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const res = await api.get("/guardians/profile");
        setAuth({ ...res.data, token }); // Include token in auth state
      } catch (err) {
        console.error("Error fetching guardian profile:", err);
        localStorage.removeItem("token"); // Remove invalid token
        setAuth(null);
      }
    } else {
      setAuth(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGuardian();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const res = await api.post("/guardians/login", { username, password });
      const { token, ...userData } = res.data;
      localStorage.setItem("token", token); // Save token to localStorage
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`; // Set token for future requests
      setAuth({ ...userData, token });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Optional: Call logout endpoint if you have server-side token invalidation
      await api.post("/guardians/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token"); // Clear token
      delete api.defaults.headers.common["Authorization"]; // Remove token from headers
      setAuth(null);
    }
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};