// OperatorAuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import api from "../api";

export const OperatorAuthContext = createContext();

export const OperatorAuthProvider = ({ children }) => {
  const [operator, setOperator] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if operator logged in via cookie
  const fetchOperator = async () => {
    try {
      const res = await api.get("/operators/profile"); // cookie sent automatically
      setOperator(res.data);
    } catch (err) {
      setOperator(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperator();
  }, []);

  const login = async (username, password) => {
    await api.post("/operators/login", { username, password });
    await fetchOperator(); // fetch info after login
  };

  const logout = async () => {
    await api.post("/operators/logout"); // clear cookie on backend
    setOperator(null);
  };

  return (
    <OperatorAuthContext.Provider value={{ operator, login, logout, loading }}>
      {children}
    </OperatorAuthContext.Provider>
  );
};
