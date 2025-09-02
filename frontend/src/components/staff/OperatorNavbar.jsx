import React from "react";
import { User, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const OperatorNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const name = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/staff/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-yellow-600 text-white p-4 flex justify-between items-center">
      {/* Left tabs */}
      <div className="flex items-center space-x-4">
        <Link
          to="/staff/operator-dashboard"
          className={`font-bold text-lg px-3 py-2 rounded ${isActive("/staff/operator-dashboard") ? "bg-yellow-500" : "hover:bg-yellow-500"
            }`}
        >
          Operator Portal
        </Link>
        <Link
          to="/staff/operator-dashboard/elder-requests"
          className={`px-3 py-2 rounded ${isActive("/staff/operator-dashboard/elder-requests") ? "bg-yellow-500" : "hover:bg-yellow-500"
            }`}
        >
          Elder Requests
        </Link>
        <Link
          to="/staff/operator-dashboard/assign-caretaker"
          className={`px-3 py-2 rounded ${isActive("/staff/operator-dashboard/assign-caretaker") ? "bg-yellow-500" : "hover:bg-yellow-500"
            }`}
        >
          Assign Caretaker
        </Link>
      </div>

      {/* Right profile + logout */}
      <div className="flex items-center space-x-4">
        <Link
          to="/staff/operator-dashboard"
          className="flex items-center space-x-1 hover:bg-yellow-500 px-3 py-2 rounded"
        >
          <User size={20} />
          <span>{name}</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-1 hover:bg-yellow-500 px-3 py-2 rounded"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default OperatorNavbar;
