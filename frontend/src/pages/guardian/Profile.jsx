import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext ';
import axios from 'axios';

const Profile = () => {
  const { auth, logout, loading } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [elders, setElders] = useState([]);
  const [error, setError] = useState('');

  const API_URL = 'http://localhost:5000/api/elders';

  const fetchMyElders = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/my-elders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setElders(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch elders');
    }
  };

  useEffect(() => {
    if (!loading && !auth) {
      navigate('/login');
    } else if (auth) {
      fetchMyElders();
    }
  }, [auth, loading, navigate]);

  if (loading) return <div className="flex justify-center items-center h-48"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (!auth) return null;

  return (
    <div data-theme={theme} className="min-h-screen bg-base-200 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center text-primary">
            Guardian Profile
          </h1>
        </div>

        {/* Error Message */}
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

        {/* Profile Details */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">Welcome, {auth.name}</h2>
            <p>Email: {auth.email}</p>
            <p>Phone: {auth.phone || 'N/A'}</p>
            <p>Address: {auth.address || 'N/A'}</p>
            <div className="card-actions justify-end space-x-2">
              <Link to="/elder-register" className="btn btn-primary">
                Request Elder Account
              </Link>
              <button onClick={logout} className="btn btn-error">
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* My Elders Section */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">My Elders</h2>
            {elders.length === 0 ? (
              <p>No elder requests found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead className="bg-base-200 text-base-content">
                    <tr>
                      <th>Full Name</th>
                      <th>Date of Birth</th>
                      <th>Status</th>
                      <th>Rejection Reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {elders.map((elder) => (
                      <tr key={elder._id} className="hover">
                        <td>{elder.fullName}</td>
                        <td>{new Date(elder.dob).toLocaleDateString()}</td>
                        <td>
                          <span
                            className={`badge ${
                              elder.status === 'DISABLED_PENDING_REVIEW'
                                ? 'badge-warning'
                                : elder.status === 'APPROVED_AWAITING_PAYMENT'
                                ? 'badge-info'
                                : elder.status === 'ACTIVE'
                                ? 'badge-success'
                                : elder.status === 'REJECTED'
                                ? 'badge-error'
                                : 'badge-neutral'
                            }`}
                          >
                            {elder.status === 'DISABLED_PENDING_REVIEW'
                              ? 'Pending Review'
                              : elder.status}
                          </span>
                        </td>
                        <td>{elder.status === 'REJECTED' ? elder.rejectionReason || 'N/A' : 'N/A'}</td>
                        <td>
                          {elder.status === 'APPROVED_AWAITING_PAYMENT' && (
                            <Link
                              to={`/payment/${elder._id}`}
                              className="btn btn-primary btn-sm"
                            >
                              Proceed to Payment
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;