import React, { createContext, useState, useEffect, useRef } from "react";

export const StaffThemeContext = createContext();

export const StaffThemeProvider = ({ children }) => {
  // Initialize theme from localStorage, fallback to "light"
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("staffTheme");
    const initialTheme = savedTheme ? savedTheme : "light";
    console.log("Initial theme from localStorage:", initialTheme); // Debug log
    return initialTheme;
  });

  const staffContainerRef = useRef(null);

  // Apply theme to staff container on mount and update on theme change
  useEffect(() => {
    if (staffContainerRef.current) {
      console.log("Applying theme to staff container:", theme); // Debug log
      staffContainerRef.current.setAttribute("data-theme", theme);
      localStorage.setItem("staffTheme", theme);
    } else {
      console.error("Staff container ref not found"); // Debug error
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    console.log("Toggling theme to:", newTheme); // Debug log
    setTheme(newTheme);
  };

  return (
    <StaffThemeContext.Provider value={{ theme, toggleTheme }}>
      <div ref={staffContainerRef} style={{ width: "100%", height: "100%" }} className="staff-content">
        {children}
      </div>
    </StaffThemeContext.Provider>
  );
};