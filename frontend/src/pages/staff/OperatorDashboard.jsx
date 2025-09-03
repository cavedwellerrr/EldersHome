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

  const API_URL = 'http://localhost:5000/api/elders';

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
      fetchPendingRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request');
    }
  };

  const openRejectModal = (id) => {
    setSelectedElderId(id);
    setRejectionReason('');
    setIsModalOpen(true);
  };

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
      fetchPendingRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request');
    }
  };

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
      fetchPendingRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate elder');
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  return (
    <div data-theme="forest" className="min-h-screen bg-base-200 p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-primary">
          Pending Review
        </h1>

        {/* Error and Success Messages */}
        {error && (
          <div className="alert alert-error shadow-lg mb-4">
            <div className="flex justify-between w-full items-center">
              <span>{error}</span>
              <button onClick={() => setError('')} className="btn btn-sm btn-ghost">
                ✕
              </button>
            </div>
          </div>
        )}
        {successMessage && (
          <div className="alert alert-success shadow-lg mb-4">
            <div className="flex justify-between w-full items-center">
              <span>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage('')}
                className="btn btn-sm btn-ghost"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead className="bg-base-200 text-base-content">
                    <tr>
                      <th>Full Name</th>
                      <th>DOB</th>
                      <th>Medical Notes</th>
                      <th>Guardian</th>
                      <th>Date Requested</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((elder) => (
                      <tr key={elder._id} className="hover">
                        <td>{elder.fullName}</td>
                        <td>{new Date(elder.dob).toLocaleDateString()}</td>
                        <td>{elder.medicalNotes || 'N/A'}</td>
                        <td>{elder.guardian?.fullName || elder.guardian?.name || 'N/A'}</td>
                        <td>{new Date(elder.createdAt).toLocaleDateString()}</td>
                        <td className="space-x-2 flex justify-center">
                          {elder.status === 'DISABLED_PENDING_REVIEW' && (
                            <>
                              <button
                                onClick={() => handleApprove(elder._id)}
                                className="btn btn-success btn-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openRejectModal(elder._id)}
                                className="btn btn-error btn-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {elder.status === 'PAYMENT_SUCCESS' && (
                            <button
                              onClick={() => handleActivate(elder._id)}
                              className="btn btn-info btn-sm"
                            >
                              Activate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Reason Modal */}
        {isModalOpen && (
          <dialog open className="modal modal-open">
            <div className="modal-box">
              <h2 className="text-lg font-bold mb-4">Reject Elder Request</h2>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="textarea textarea-bordered w-full"
                placeholder="Enter rejection reason"
                rows="4"
              />
              <div className="modal-action">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                  className={`btn ${rejectionReason.trim() ? 'btn-error' : 'btn-disabled'}`}
                >
                  Submit
                </button>
              </div>
            </div>
          </dialog>
        )}
      </div>
    </div>
  );
};

export default OperatorDashboard;