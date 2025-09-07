import React from "react";
import { User, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const CaretakerNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const name = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/staff/login");
  };

  // Highlight active tab
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Left side tabs */}
        <div className="flex items-center space-x-6 text-lg font-medium">
          <Link
            to="/staff/caretaker-dashboard"
            className={`transition ${isActive("/staff/caretaker-dashboard")
              ? "font-bold text-yellow-300"
              : "hover:text-yellow-200"
              }`}
          >
            Caretaker Portal
          </Link>
          <Link
            to="/staff/caretaker-dashboard/assigned-elders"
            className={`transition ${isActive("/staff/caretaker-dashboard/assigned-elders")
              ? "font-bold text-yellow-300"
              : "hover:text-yellow-200"
              }`}
          >
            Assigned Elders
          </Link>
          <Link
            to="/staff/caretaker-dashboard/meals"
            className={`transition ${isActive("/staff/caretaker-dashboard/meals")
              ? "font-bold text-yellow-300"
              : "hover:text-yellow-200"
              }`}
          >
            Meals
          </Link>
          <Link
            to="/staff/caretaker-dashboard/rooms"
            className={`transition ${isActive("/staff/caretaker-dashboard/rooms")
              ? "font-bold text-yellow-300"
              : "hover:text-yellow-200"
              }`}
          >
            {/* Rooms
          </Link>
          <Link
            to="/staff/caretaker-dashboard/events"
            className={`transition ${
              isActive("/staff/caretaker-dashboard/events")
                ? "font-bold text-yellow-300"
                : "hover:text-yellow-200"
            }`}
          > */}
            Events
          </Link>
        </div>

        {/* Right side profile + logout */}
        <div className="flex items-center space-x-5 text-lg font-medium">
          <Link
            to="/staff/caretaker-dashboard"
            className="flex items-center space-x-2 transition hover:text-yellow-200"
          >
            <User size={22} />
            <span>{name}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 transition hover:text-yellow-200"
          >
            <LogOut size={22} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default CaretakerNavbar;