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

  // Base API URL (adjust to your backend URL)
  const API_URL = 'http://localhost:5000/api/elders';
  const token = localStorage.getItem('token');

  // Redirect to login if no token
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Fetch elders with pending payments
  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/pending-payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('API Response:', response.data); // Debug log
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

  // Send payment reminder
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
      fetchPendingPayments(); // Refresh to update reminderSentAt
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Unauthorized: Please log in again'
          : err.response?.data?.message || 'Failed to send reminder'
      );
    }
  };

  // Activate elder
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

  // Handle sorting
  const handleSort = (column) => {
    const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(direction);
  };

  // Sort elders based on current sortColumn and sortDirection
  const sortedElders = [...elders].sort((a, b) => {
    let valA, valB;
    if (sortColumn === 'dob') {
      valA = new Date(a.dob).getTime();
      valB = new Date(b.dob).getTime();
    } else if (sortColumn === 'amount') {
      valA = a.paymentId?.amount || 0;
      valB = b.paymentId?.amount || 0;
    } else {
      valA = (a[sortColumn] || '').toString().toLowerCase();
      valB = (b[sortColumn] || '').toString().toLowerCase();
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch elders on component mount
  useEffect(() => {
    fetchPendingPayments();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pending Payments Dashboard</h1>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 font-bold">
            ×
          </button>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4 flex justify-between">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-green-700 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex justify-center items-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
            />
          </svg>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th
                  className="py-2 px-4 border cursor-pointer"
                  onClick={() => handleSort('fullName')}
                >
                  Full Name {sortColumn === 'fullName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="py-2 px-4 border cursor-pointer"
                  onClick={() => handleSort('dob')}
                >
                  DOB {sortColumn === 'dob' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="py-2 px-4 border">Medical Notes</th>
                <th className="py-2 px-4 border">Guardian</th>
                <th className="py-2 px-4 border">Status</th>
                <th
                  className="py-2 px-4 border cursor-pointer"
                  onClick={() => handleSort('amount')}
                >
                  Payment Amount {sortColumn === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="py-2 px-4 border">Reminder Sent</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedElders.map((elder) => (
                <tr key={elder._id}>
                  <td className="py-2 px-4 border">{elder.fullName}</td>
                  <td className="py-2 px-4 border">
                    {new Date(elder.dob).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border">{elder.medicalNotes || 'N/A'}</td>
                  <td className="py-2 px-4 border">
                    {elder.guardian?.fullName || elder.guardian?.name || 'N/A'}
                  </td>
                  <td className="py-2 px-4 border">{elder.status}</td>
                  <td className="py-2 px-4 border">{elder.paymentId?.amount || 'N/A'}</td>
                  <td className="py-2 px-4 border text-center">
                    {elder.paymentId?.reminderSentAt ? '✅' : '❌'}
                  </td>
                  <td className="py-2 px-4 border space-x-2">
                    {elder.status === 'APPROVED_AWAITING_PAYMENT' && (
                      <button
                        onClick={() => handleSendReminder(elder._id)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Send Payment Reminder
                      </button>
                    )}
                    {elder.status === 'PAYMENT_SUCCESS' && (
                      <button
                        onClick={() => handleActivate(elder._id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
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
      )}
    </div>
  );
};

export default PendingPaymentsDashboard;