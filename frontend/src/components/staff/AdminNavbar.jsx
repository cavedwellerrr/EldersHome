import React, { useContext } from "react";
import { User, LogOut, Sun, Moon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";


const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const name = localStorage.getItem("username");


  const handleLogout = () => {
    localStorage.clear();
    navigate("/staff/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      {/* Left side tabs */}
      <div className="flex items-center space-x-4">
        <Link
          to="/staff/admin-dashboard"
          className={`font-bold text-lg px-3 py-2 rounded ${isActive("/staff/admin-dashboard") ? "bg-blue-500" : "hover:bg-blue-500"}`}
        >
          Admin Portal
        </Link>
        <Link
          to="/staff/admin-dashboard/view-staff"
          className={`px-3 py-2 rounded ${isActive("/staff/admin-dashboard/view-staff") ? "bg-blue-500" : "hover:bg-blue-500"}`}
        >
          View Staff
        </Link>
        <Link
          to="/staff/admin-dashboard/staff-register"
          className={`px-3 py-2 rounded ${isActive("/staff/admin-dashboard/staff-register") ? "bg-blue-500" : "hover:bg-blue-500"}`}
        >
          Register Staff
        </Link>
        <Link
          to="/staff/admin-dashboard/donations"
          className={`px-3 py-2 rounded ${isActive("/staff/admin-dashboard/donations") ? "bg-blue-500" : "hover:bg-blue-500"}`}
        >
          Donations
        </Link>
        <Link
          to="/staff/admin-dashboard/events"
          className={`px-3 py-2 rounded ${isActive("/staff/admin-dashboard/events") ? "bg-blue-500" : "hover:bg-blue-500"}`}
        >
          Events
        </Link>
      </div>

      {/* Right side profile + logout + theme toggle */}
      <div className="flex items-center space-x-4">

        <Link
          to="/staff/admin-dashboard"
          className="flex items-center space-x-1 hover:bg-blue-500 px-3 py-2 rounded"
        >
          <User size={20} />
          <span>{name}</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-1 hover:bg-blue-500 px-3 py-2 rounded"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
