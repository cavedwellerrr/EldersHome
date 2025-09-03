import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("mainTheme");
    return savedTheme ? savedTheme : "light"; // Fallback to "light" if no saved theme
  });

  useEffect(() => {
    // Apply theme to html element on mount and whenever theme changes
    document.querySelector("html").setAttribute("data-theme", theme);
    localStorage.setItem("mainTheme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};