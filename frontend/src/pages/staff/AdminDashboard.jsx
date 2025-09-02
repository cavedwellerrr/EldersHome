import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";

const AdminDashboard = () => {
  const name = localStorage.getItem("username"); // or staffName
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/staff/login");
  };

  return (
    <div>


      {/* Dashboard Content */}
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p className="mb-4">Welcome, {name}</p>
        <Link to="/staff/admin-dashboard/staff-register">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500">
            Register New Staff
          </button>
        </Link>
        <Link to="/staff/admin-dashboard/view-staff" className="ml-4">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500">
            View Staff Members
          </button>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
