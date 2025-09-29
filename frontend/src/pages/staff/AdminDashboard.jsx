// AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api"; // Assuming you have your API instance
import StaffChatDashboard from "./StaffChatDashboard"; // Adjust path if needed
import { socket } from "../../utils/socket"; // Adjust path if needed

const AdminDashboard = () => {
  const name = localStorage.getItem("staffName");
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStaff: 0,
    pendingDonations: 0,
    upcomingEvent: null,
    loading: true,
  });
  const [showChat, setShowChat] = useState(false);
  const [newMessages, setNewMessages] = useState(0);

  useEffect(() => {
    const handleSupportRequest = (data) => {
      console.log("Received support request for notification:", data);
      setNewMessages((prev) => prev + 1);
    };

    socket.on("supportRequest", handleSupportRequest);

    return () => {
      socket.off("supportRequest", handleSupportRequest);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/staff/login");
  };

  const handleOpenChat = () => {
    console.log("Opening chat popup, resetting notifications");
    setShowChat(true);
    setNewMessages(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Welcome back, {name}!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Good day, {name}!</h2>
              <p className="text-orange-100 text-lg">Let's see what's happening today.</p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
              </svg>
              Quick Actions
            </h2>
            <p className="text-orange-100 mt-1">Frequently used admin functions</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/staff/admin-dashboard/staff-register"
                className="group bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Add Staff</p>
                    <p className="text-sm text-gray-600">Register new member</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/staff/admin-dashboard/view-staff"
                className="group bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63c-.34-.98-1.56-1.37-2.35-1.37-.47 0-.91.17-1.25.47L14 7.75V12c0 1.11-.89 2-2 2s-2-.89-2-2V5c0-1.11.89-2 2-2s2 .89 2 2v3l4.05-2.76c.85-.58 2-.58 2.85 0L22 8v14h-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">View Staff</p>
                    <p className="text-sm text-gray-600">Manage team</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/staff/admin-dashboard/events"
                className="group bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Events</p>
                    <p className="text-sm text-gray-600">Manage events</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/staff/admin-dashboard/donations"
                className="group bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Donations</p>
                    <p className="text-sm text-gray-600">Review & manage</p>
                  </div>
                </div>
              </Link>
              <button
              onClick={handleOpenChat}
              className="group bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md relative"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 4h-4v2h4V6zm-4 4h4v2h-4v-2zm4 4h-4v2h4v-2zm-6-8H6v8h6V6zm-8 10h8v2H4v-2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Chat Support</p>
                  <p className="text-sm text-gray-600">Handle support requests</p>
                </div>
              </div>
              {newMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {newMessages}
                </span>
              )}
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Popup Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-4/5 max-w-4xl h-4/5 rounded-lg overflow-hidden relative">
            <button
              onClick={() => setShowChat(false)}
              className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 z-10"
            >
              Close
            </button>
            <StaffChatDashboard />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;