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
    <nav className="bg-green-600 text-white p-4 flex justify-between items-center">
      {/* Left side tabs */}
      <div className="flex items-center space-x-4">
        <Link
          to="/staff/caretaker-dashboard"
          className={`font-bold text-lg px-3 py-2 rounded ${isActive("/staff/caretaker-dashboard") ? "bg-green-500" : "hover:bg-green-500"}`}
        >
          Caretaker Portal
        </Link>
        <Link
          to="/staff/caretaker-dashboard/assigned-elders"
          className={`px-3 py-2 rounded ${isActive("/staff/caretaker-dashboard/assigned-elders") ? "bg-green-500" : "hover:bg-green-500"}`}
        >
          Assigned Elders
        </Link>
        <Link
          to="/staff/caretaker-dashboard/meals"
          className={`px-3 py-2 rounded ${isActive("/staff/caretaker-dashboard/meals") ? "bg-green-500" : "hover:bg-green-500"}`}
        >
          Meals
        </Link>
        <Link
          to="/staff/caretaker-dashboard/rooms"
          className={`px-3 py-2 rounded ${isActive("/staff/caretaker-dashboard/rooms") ? "bg-green-500" : "hover:bg-green-500"}`}
        >
          Rooms
        </Link>
        <Link
          to="/staff/caretaker-dashboard/events"
          className={`px-3 py-2 rounded ${isActive("/staff/caretaker-dashboard/events") ? "bg-green-500" : "hover:bg-green-500"}`}
        >
          Events
        </Link>
      </div>

      {/* Right side profile + logout */}
      <div className="flex items-center space-x-4">
        <Link
          to="/staff/caretaker-dashboard"
          className="flex items-center space-x-1 hover:bg-green-500 px-3 py-2 rounded"
        >
          <User size={20} />
          <span>{name}</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-1 hover:bg-green-500 px-3 py-2 rounded"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default CaretakerNavbar;
