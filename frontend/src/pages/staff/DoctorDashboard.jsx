import React from "react";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const name = localStorage.getItem("username");
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Doctor Dashboard</h1>
      <p className="mb-4">Welcome, Dr. {name}</p>
      <button
        onClick={() => navigate("/staff/doctor-dashboard/assigned-elders")}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
      >
        View Assigned Elders
      </button>
    </div>
  );
};

export default DoctorDashboard;
