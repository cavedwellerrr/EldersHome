import React from "react";
import { User, LogOut } from "lucide-react";
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
    <nav className="bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Left side tabs */}
        <div className="flex items-center space-x-6 text-lg font-medium">
          <Link
            to="/staff/admin-dashboard"
            className={`transition ${
              isActive("/staff/admin-dashboard")
                ? "font-bold text-yellow-300"
                : "hover:text-yellow-200"
            }`}
          >
            Admin Portal
          </Link>
          <Link
            to="/staff/admin-dashboard/view-staff"
            className={`transition ${
              isActive("/staff/admin-dashboard/view-staff")
                ? "font-bold text-yellow-300"
                : "hover:text-yellow-200"
            }`}
          >
            View Staff
          </Link>
          <Link
            to="/staff/admin-dashboard/staff-register"
            className={`transition ${
              isActive("/staff/admin-dashboard/staff-register")
                ? "font-bold text-yellow-300"
                : "hover:text-yellow-200"
            }`}
          >
            Register Staff
          </Link>
          <Link
            to="/staff/admin-dashboard/donations"
            className={`transition ${
              isActive("/staff/admin-dashboard/donations")
                ? "font-bold text-yellow-300"
                : "hover:text-yellow-200"
            }`}
          >
            Donations
          </Link>
          <Link
            to="/staff/admin-dashboard/events"
            className={`transition ${
              isActive("/staff/admin-dashboard/events")
                ? "font-bold text-yellow-300"
                : "hover:text-yellow-200"
            }`}
          >
            Events
          </Link>
          <Link
            to="/staff/admin-dashboard/inventory"
            className={`transition ${
              isActive("/staff/admin-dashboard/inventory")
                ? "font-bold text-yellow-300"
                : "hover:text-yellow-200"
            }`}
          >
            Inventory
          </Link>
        </div>

        {/* Right side profile + logout */}
        <div className="flex items-center space-x-5 text-lg font-medium">
          <Link
            to="/staff/admin-dashboard"
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

export default AdminNavbar;
