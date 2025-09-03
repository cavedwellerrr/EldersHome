import React, { useContext } from "react";
import { User, LogOut, Sun, Moon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

const Navbar = () => {
  const { auth, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link to="/" className="font-bold text-lg">EldersHome</Link>
        <Link to="/events" className="hover:bg-blue-500 px-3 py-2 rounded">Events</Link>
        <Link to="/donations" className="hover:bg-blue-500 px-3 py-2 rounded">Donations</Link>
        <Link to="/about" className="hover:bg-blue-500 px-3 py-2 rounded">About Us</Link>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded hover:bg-blue-500"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {auth ? (
          <>
            <Link
              to="/profile"
              className="flex items-center space-x-1 hover:bg-blue-500 px-3 py-2 rounded"
            >
              <User size={20} />
              <span>{auth.name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 hover:bg-blue-500 px-3 py-2 rounded"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center space-x-1 hover:bg-blue-500 px-3 py-2 rounded"
          >
            <User size={20} />
            <span>Profile</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
