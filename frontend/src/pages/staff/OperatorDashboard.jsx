import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext ';

const OperatorDashboard = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [elders, setElders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedElderId, setSelectedElderId] = useState(null);
  const [sortColumn, setSortColumn] = useState('fullName');
  const [sortDirection, setSortDirection] = useState('asc');

  const API_URL = 'http://localhost:5000/api/elders';
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const fetchPendingReview = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Pending Review API Response:', response.data);
      setElders(response.data);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Unauthorized: Please log in again'
          : err.response?.data?.message || 'Failed to fetch pending elders'
      );
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setError('');
      setSuccessMessage('');
      const response = await axios.patch(
        `${API_URL}/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage(response.data.message || 'Elder approved successfully');
      fetchPendingReview();
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Unauthorized: Please log in again'
          : err.response?.data?.message || 'Failed to approve elder'
      );
    }
  };

  const handleReject = async () => {
    try {
      setError('');
      setSuccessMessage('');
      const response = await axios.patch(
        `${API_URL}/${selectedElderId}/reject`,
        { reason: rejectReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage(response.data.message || 'Elder rejected successfully');
      setRejectModalOpen(false);
      setRejectReason('');
      setSelectedElderId(null);
      fetchPendingReview();
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Unauthorized: Please log in again'
          : err.response?.data?.message || 'Failed to reject elder'
      );
      setRejectModalOpen(false);
    }
  };

  const openRejectModal = (id) => {
    setSelectedElderId(id);
    setRejectModalOpen(true);
  };

  const handleSort = (column) => {
    const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(direction);
  };

  const sortedElders = [...elders].sort((a, b) => {
    let valA, valB;
    if (sortColumn === 'dob' || sortColumn === 'createdAt') {
      valA = new Date(a[sortColumn]).getTime();
      valB = new Date(b[sortColumn]).getTime();
    } else {
      valA = (a[sortColumn] || '').toString().toLowerCase();
      valB = (b[sortColumn] || '').toString().toLowerCase();
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    fetchPendingReview();
  }, []);

  return (
    <div data-theme={theme} className="min-h-screen bg-base-200 p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center text-primary">
            Operator Dashboard
          </h1>
          <button onClick={toggleTheme} className="btn btn-outline btn-sm">
            {theme === 'lemonade' ? 'Switch to Dark' : 'Switch to Light'}
          </button>
        </div>

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
                      <th className="cursor-pointer" onClick={() => handleSort('fullName')}>
                        Full Name {sortColumn === 'fullName' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="cursor-pointer" onClick={() => handleSort('dob')}>
                        DOB {sortColumn === 'dob' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Medical Notes</th>
                      <th>Guardian</th>
                      <th>Medical Report</th>
                      <th className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                        Date Requested {sortColumn === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedElders.map((elder) => (
                      <tr key={elder._id} className="hover">
                        <td>{elder.fullName}</td>
                        <td>{new Date(elder.dob).toLocaleDateString()}</td>
                        <td>{elder.medicalNotes || 'N/A'}</td>
                        <td>{elder.guardian?.name || elder.guardian?.fullName || 'N/A'}</td>
                        <td>
                          {elder.medicalNotesFile ? (
                            <a
                              href={`http://localhost:5000/${elder.medicalNotesFile}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary btn-sm"
                            >
                              View Report
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>{new Date(elder.createdAt).toLocaleDateString()}</td>
                        <td className="space-x-2 flex justify-center">
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {rejectModalOpen && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h2 className="text-lg font-bold mb-4">Reject Elder Request</h2>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Reason for Rejection</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="textarea textarea-bordered"
                  placeholder="Enter reason for rejection"
                  rows="4"
                />
              </div>
              <div className="modal-action">
                <button onClick={handleReject} className="btn btn-error">
                  Submit
                </button>
                <button
                  onClick={() => {
                    setRejectModalOpen(false);
                    setRejectReason('');
                    setSelectedElderId(null);
                  }}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperatorDashboard;