// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import api from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null); // stores logged-in guardian info
  const [loading, setLoading] = useState(true);

  // Check if guardian is logged in on app load
  const fetchGuardian = async () => {
    try {
      const res = await api.get("/guardians/profile");
      setAuth(res.data);
    } catch (err) {
      setAuth(null);
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
     fetchGuardian();
   }, []);

  // Login function
  const login = async (username, password) => {
    const res = await api.post("/guardians/login", { username, password });
    setAuth(res.data); // store guardian info
  };

  // Logout function
  const logout = async () => {
    try {
      await api.post("/guardians/logout");
      setAuth(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
