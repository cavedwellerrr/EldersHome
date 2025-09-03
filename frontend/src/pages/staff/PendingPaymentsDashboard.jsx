import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

const PendingPaymentsDashboard = () => {
  const [elders, setElders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sortColumn, setSortColumn] = useState('fullName');
  const [sortDirection, setSortDirection] = useState('asc');

  const API_URL = 'http://localhost:5000/api/elders';
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/pending-payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('API Response:', response.data);
      setElders(response.data);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Unauthorized: Please log in again'
          : err.response?.data?.message || 'Failed to fetch pending payments'
      );
      setLoading(false);
    }
  };

  const handleSendReminder = async (id) => {
    try {
      setError('');
      setSuccessMessage('');
      const response = await axios.patch(
        `${API_URL}/${id}/send-reminder`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage(response.data.message || 'Payment reminder sent.');
      fetchPendingPayments();
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Unauthorized: Please log in again'
          : err.response?.data?.message || 'Failed to send reminder'
      );
    }
  };

  const handleActivate = async (id) => {
    try {
      setError('');
      setSuccessMessage('');
      const response = await axios.patch(
        `${API_URL}/${id}/activate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage(response.data.message || 'Elder activated.');
      fetchPendingPayments();
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Unauthorized: Please log in again'
          : err.response?.data?.message || 'Failed to activate elder'
      );
    }
  };

  const handleSort = (column) => {
    const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(direction);
  };

  const sortedElders = [...elders].sort((a, b) => {
    let valA, valB;
    if (sortColumn === 'dob') {
      valA = new Date(a.dob).getTime();
      valB = new Date(b.dob).getTime();
    } else if (sortColumn === 'createdAt') {
      valA = new Date(a.createdAt).getTime();
      valB = new Date(b.createdAt).getTime();
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
    fetchPendingPayments();
  }, []);

  return (
    <div data-theme="forest" className="min-h-screen bg-base-200 p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-primary">
          Pending Payments Dashboard
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
                      <th className="cursor-pointer" onClick={() => handleSort('fullName')}>
                        Full Name {sortColumn === 'fullName' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="cursor-pointer" onClick={() => handleSort('dob')}>
                        DOB {sortColumn === 'dob' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Medical Notes</th>
                      <th>Guardian</th>
                      <th className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                        Date Requested {sortColumn === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Medical Reports</th>
                      <th>Reminder Sent</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedElders.map((elder) => (
                      <tr key={elder._id} className="hover">
                        <td>{elder.fullName}</td>
                        <td>{new Date(elder.dob).toLocaleDateString()}</td>
                        <td>{elder.medicalNotes || 'N/A'}</td>
                        <td>{elder.guardian?.fullName || elder.guardian?.name || 'N/A'}</td>
                        <td>{new Date(elder.createdAt).toLocaleDateString()}</td>
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
                        <td className="text-center">
                          {elder.paymentId?.reminderSentAt ? '✅' : '❌'}
                        </td>
                        <td className="space-x-2 flex justify-center">
                          {elder.status === 'APPROVED_AWAITING_PAYMENT' && (
                            <button
                              onClick={() => handleSendReminder(elder._id)}
                              className="btn btn-warning btn-sm"
                            >
                              Send Reminder
                            </button>
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
      </div>
    </div>
  );
};

export default PendingPaymentsDashboard;