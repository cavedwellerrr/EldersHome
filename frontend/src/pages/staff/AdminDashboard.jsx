import React from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const name = localStorage.getItem("username"); // or staffName
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/staff/login");
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content p-6">
      {/* Dashboard Content */}
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p>Welcome, {name}</p>

        <div className="flex flex-wrap gap-4">
          <Link to="/staff/admin-dashboard/staff-register">
            <button className="btn btn-primary">Register New Staff</button>
          </Link>

          <Link to="/staff/admin-dashboard/view-staff">
            <button className="btn btn-success">View Staff Members</button>
          </Link>

          <button onClick={handleLogout} className="btn btn-error ml-auto">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
