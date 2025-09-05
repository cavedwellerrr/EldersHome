import React from "react";
import { User, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const DoctorNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const name = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/staff/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-green-600 text-white p-4 flex justify-between items-center">
      {/* Left tabs */}
      <div className="flex items-center space-x-4">
        <Link
          to="/staff/doctor-dashboard"
          className={`font-bold text-lg px-3 py-2 rounded ${isActive("/staff/doctor-dashboard") ? "bg-green-500" : "hover:bg-green-500"
            }`}
        >
          Doctor Portal
        </Link>
        <Link
          to="/staff/doctor-dashboard/elders"
          className={`px-3 py-2 rounded ${isActive("/staff/doctor-dashboard/elders") ? "bg-green-500" : "hover:bg-green-500"
            }`}
        >
          Elders
        </Link>
        <Link
          to="/staff/doctor-dashboard/appointments"
          className={`px-3 py-2 rounded ${isActive("/staff/doctor-dashboard/appointments") ? "bg-green-500" : "hover:bg-green-500"
            }`}
        >
          Appointments
        </Link>
        <Link
          to="/staff/doctor-dashboard/consultations"
          className={`px-3 py-2 rounded ${isActive("/staff/doctor-dashboard/consultations") ? "bg-green-500" : "hover:bg-green-500"
            }`}
        >
          Consultations
        </Link>
                <Link
          to="/staff/doctor-dashboard/medicalrecords"
          className={`px-3 py-2 rounded ${isActive("/staff/doctor-dashboard/medicalrecords") ? "bg-green-500" : "hover:bg-green-500"
            }`}
        >
          Medical Records
        </Link>
      </div>

      {/* Right profile + logout */}
      <div className="flex items-center space-x-4">
        <Link
          to="/staff/doctor-dashboard"
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

export default DoctorNavbar;
