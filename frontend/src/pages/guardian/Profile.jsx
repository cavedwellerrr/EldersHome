import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api";

const Profile = () => {
  const { auth, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [elders, setElders] = useState([]);

  useEffect(() => {
    if (!loading && !auth) {
      navigate("/login");
    }
  }, [auth, loading, navigate]);

  useEffect(() => {
    const fetchElders = async () => {
      try {
        if (auth?._id) {
          const res = await api.get(`/elders/guardian/${auth._id}`);
          setElders(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch elders:", err);
      }
    };
    fetchElders();
  }, [auth]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg text-orange-500"></div>
        <p className="mt-4 text-gray-600">Loading your profile...</p>
      </div>
    </div>
  );
  
  if (!auth) return null;

  const formatStatus = (status) => {
    switch (status) {
      case "APPROVED_AWAITING_PAYMENT":
        return "Approved – awaiting caretaker assign";
      case "DISABLED_PENDING_REVIEW":
        return "Pending Review";
      case "PAYMENT_SUCCESS":
        return "Payment Successful";
      case "ACTIVE":
        return "Active";
      case "REJECTED":
        return "Rejected";
      default:
        return status;
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-600 font-semibold";
      case "REJECTED":
        return "text-red-600 font-semibold";
      case "APPROVED_AWAITING_PAYMENT":
        return "text-yellow-600 font-semibold";
      case "DISABLED_PENDING_REVIEW":
        return "text-gray-600 font-semibold";
      case "PAYMENT_SUCCESS":
        return "text-blue-600 font-semibold";
      default:
        return "text-gray-800";
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "ACTIVE":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "REJECTED":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "APPROVED_AWAITING_PAYMENT":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "DISABLED_PENDING_REVIEW":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case "PAYMENT_SUCCESS":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your elderly care services</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="avatar placeholder">
                <div className="bg-orange-500 text-white rounded-full w-12">
                  <span className="text-lg font-bold">
                    {auth.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-900">{auth.name}</p>
                <p className="text-sm text-gray-500">Guardian</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Profile Information Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-8 text-center">
                <div className="avatar placeholder mb-4">
                  <div className="bg-white text-orange-500 rounded-full w-20">
                    <span className="text-2xl font-bold">
                      {auth.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {auth.name}
                </h2>
                <p className="text-orange-100">Guardian Account</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{auth.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{auth.phone}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">{auth.address}</p>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <Link
                    to="/elder-register"
                    className="btn btn-primary bg-orange-500 hover:bg-orange-600 border-orange-500 hover:border-orange-600 w-full text-white"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Request Elder Account
                  </Link>
                  
                  <button
                    onClick={logout}
                    className="btn btn-outline btn-error w-full"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Elders Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">My Elders</h3>
                    <p className="text-gray-600 mt-1">
                      {elders.length === 0 ? "No elders registered yet" : `Managing ${elders.length} elder${elders.length > 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <div className="stats bg-white shadow">
                    <div className="stat">
                      <div className="stat-title text-xs">Total Elders</div>
                      <div className="stat-value text-orange-500 text-2xl">{elders.length}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {elders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Elders Yet</h4>
                    <p className="text-gray-600 mb-6">Start by registering your first elder to begin managing their care.</p>
                    <Link
                      to="/elder-register"
                      className="btn bg-orange-500 hover:bg-orange-600 text-white border-none"
                    >
                      Register First Elder
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {elders.map((elder) => (
                      <div
                        key={elder._id}
                        className="card bg-gradient-to-r from-white to-orange-50 shadow-md border border-orange-100 hover:shadow-lg transition-shadow"
                      >
                        <div className="card-body">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="avatar placeholder">
                                  <div className="bg-orange-200 text-orange-700 rounded-full w-12">
                                    <span className="font-bold">
                                      {elder.fullName?.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-xl font-bold text-gray-900">
                                    {elder.fullName}
                                  </h4>
                                  <div className={getStatusBadge(elder.status)}>
                                    {formatStatus(elder.status)}
                                  </div>
                                </div>
                              </div>

                              {elder.status === "REJECTED" && elder.rejectionReason && (
                                <div className="alert alert-error mb-4">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-sm">
                                    <strong>Rejection Reason:</strong> {elder.rejectionReason}
                                  </span>
                                </div>
                              )}

                              <div className="bg-white rounded-lg p-4 border border-orange-100">
                                <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                                  <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  Assigned Caretaker
                                </h5>
                                
                                {elder.caretaker ? (
                                  <div className="flex items-center space-x-4 bg-green-50 p-3 rounded-lg border border-green-200">
                                    <div className="avatar placeholder">
                                      <div className="bg-green-500 text-white rounded-full w-10">
                                        <span className="text-sm font-bold">
                                          {elder.caretaker.staff?.name?.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">
                                        {elder.caretaker.staff?.name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {elder.caretaker.staff?.email}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        📞 {elder.caretaker.staff?.phone}
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                      </svg>
                                    </div>
                                    <p className="text-gray-600">
                                      No caretaker assigned yet. We'll notify you once a caretaker is available.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;