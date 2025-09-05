import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OperatorDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedElderId, setSelectedElderId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Base API URL (adjust to your backend URL)
  const API_URL = 'http://localhost:5000/api/elders';

  // Fetch pending elder requests
  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pending requests');
      setLoading(false);
    }
  };

  // Approve elder request
  const handleApprove = async (id) => {
    try {
      setError('');
      setSuccessMessage('');
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage(response.data.message || 'Request approved. Awaiting payment.');
      fetchPendingRequests(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request');
    }
  };

  // Open rejection modal
  const openRejectModal = (id) => {
    setSelectedElderId(id);
    setRejectionReason('');
    setIsModalOpen(true);
  };

  // Reject elder request
  const handleReject = async () => {
    try {
      setError('');
      setSuccessMessage('');
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/${selectedElderId}/reject`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage(response.data.message || 'Request rejected.');
      setIsModalOpen(false);
      setRejectionReason('');
      fetchPendingRequests(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request');
    }
  };

  // Activate elder
  const handleActivate = async (id) => {
    try {
      setError('');
      setSuccessMessage('');
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/${id}/activate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage(response.data.message || 'Elder activated.');
      fetchPendingRequests(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate elder');
    }
  };

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch requests on component mount
  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "DISABLED_PENDING_REVIEW":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "PAYMENT_SUCCESS":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "APPROVED_AWAITING_PAYMENT":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "ACTIVE":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "REJECTED":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "DISABLED_PENDING_REVIEW":
        return "Pending Review";
      case "PAYMENT_SUCCESS":
        return "Payment Complete";
      case "APPROVED_AWAITING_PAYMENT":
        return "Approved";
      case "ACTIVE":
        return "Active";
      case "REJECTED":
        return "Rejected";
      default:
        return status;
    }
  };

  const getPendingCount = () => requests.filter(r => r.status === 'DISABLED_PENDING_REVIEW').length;
  const getPaymentSuccessCount = () => requests.filter(r => r.status === 'PAYMENT_SUCCESS').length;
  const getTotalCount = () => requests.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Operator Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage elder registration requests</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="avatar placeholder">
                <div className="bg-orange-500 text-white rounded-full w-12">
                  <span className="text-lg font-bold">OP</span>
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Operator</p>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{getPendingCount()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ready to Activate</p>
                <p className="text-2xl font-bold text-gray-900">{getPaymentSuccessCount()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{getTotalCount()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-orange-100">
          <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Elder Requests</h3>
                <p className="text-gray-600 mt-1">Review and manage registration requests</p>
              </div>
              <button
                onClick={fetchPendingRequests}
                className="btn bg-orange-500 hover:bg-orange-600 text-white border-none"
                disabled={loading}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="loading loading-spinner loading-lg text-orange-500"></div>
                  <p className="mt-4 text-gray-600">Loading requests...</p>
                </div>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Requests Found</h4>
                <p className="text-gray-600">There are currently no elder registration requests to review.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {requests.map((elder) => (
                  <div
                    key={elder._id}
                    className="bg-gradient-to-r from-white to-orange-50 rounded-xl shadow-md border border-orange-100 hover:shadow-lg transition-shadow p-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="avatar placeholder">
                              <div className="bg-orange-200 text-orange-700 rounded-full w-16">
                                <span className="text-lg font-bold">
                                  {elder.fullName?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-gray-900">{elder.fullName}</h4>
                              <div className={getStatusBadge(elder.status)}>
                                {getStatusText(elder.status)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="bg-white rounded-lg p-3 border border-orange-100">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date of Birth</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                              {new Date(elder.dob).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="bg-white rounded-lg p-3 border border-orange-100">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Guardian</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                              {elder.guardian?.fullName || elder.guardian?.name || 'N/A'}
                            </p>
                          </div>

                          <div className="bg-white rounded-lg p-3 border border-orange-100">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Requested</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                              {elder.createdAt ? new Date(elder.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>

                          <div className="bg-white rounded-lg p-3 border border-orange-100">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gender</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                              {elder.gender || 'N/A'}
                            </p>
                          </div>
                        </div>

                        {elder.medicalNotes && (
                          <div className="bg-white rounded-lg p-4 border border-orange-100 mb-4">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Medical Notes</p>
                            <p className="text-sm text-gray-700">{elder.medicalNotes}</p>
                          </div>
                        )}

                        {elder.address && (
                          <div className="bg-white rounded-lg p-4 border border-orange-100 mb-4">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Address</p>
                            <p className="text-sm text-gray-700">{elder.address}</p>
                          </div>
                        )}
                      </div>

                      <div className="lg:ml-6">
                        <div className="flex flex-col space-y-2">
                          {elder.status === 'DISABLED_PENDING_REVIEW' && (
                            <>
                              <button
                                onClick={() => handleApprove(elder._id)}
                                className="btn bg-green-500 hover:bg-green-600 text-white border-none"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Approve
                              </button>
                              <button
                                onClick={() => openRejectModal(elder._id)}
                                className="btn bg-red-500 hover:bg-red-600 text-white border-none"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reject
                              </button>
                            </>
                          )}
                          {elder.status === 'PAYMENT_SUCCESS' && (
                            <button
                              onClick={() => handleActivate(elder._id)}
                              className="btn bg-blue-500 hover:bg-blue-600 text-white border-none"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Activate
                            </button>
                          )}
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

      {/* Toast Notifications */}
      {successMessage && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success bg-green-500 text-white rounded-xl shadow-lg border-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{successMessage}</span>
            <button onClick={() => setSuccessMessage('')} className="text-white hover:text-gray-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-error bg-red-500 text-white rounded-xl shadow-lg border-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-medium">{error}</span>
            <button onClick={() => setError('')} className="text-white hover:text-gray-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Reject Elder Request</h2>
              <p className="text-gray-600 mt-1">Please provide a reason for rejection</p>
            </div>
            <div className="p-6">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 resize-none"
                placeholder="Enter detailed reason for rejection..."
                rows="4"
              />
            </div>
            <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-ghost text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className={`btn bg-red-500 hover:bg-red-600 text-white border-none ${
                  !rejectionReason.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!rejectionReason.trim()}
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorDashboard;