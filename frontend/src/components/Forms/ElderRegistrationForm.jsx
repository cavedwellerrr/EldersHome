import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext ';

const ElderRegistrationForm = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    medicalNotes: '',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccessMessage('');
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('dob', formData.dob);
      data.append('medicalNotes', formData.medicalNotes);
      if (file) {
        data.append('medicalNotesFile', file);
      }
      const token = localStorage.getItem('token');
      console.log('Submitting with Token:', token); // Debug: Log token
      const response = await axios.post('http://localhost:5000/api/elders', data, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'multipart/form-data' 
        },
      });
      console.log('Response Status:', response.status); // Debug: Log status
      console.log('Response Data:', response.data); // Debug: Log data
      setSuccessMessage(response.data.message || 'Elder request submitted successfully!');
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error Details:', {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        } : 'No response',
        request: err.request ? err.request : 'No request',
        config: err.config ? err.config : 'No config',
      }); // Debug: Log full error details
      setError(err.response?.data?.message || err.message || 'Failed to submit elder request. Check console for details.');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    navigate('/profile');
  };

  return (
    <div data-theme={theme} className="min-h-screen bg-base-200 p-6">
      <div className="container mx-auto max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center text-primary">
            Register Elder
          </h1>
          <button onClick={toggleTheme} className="btn btn-outline btn-sm">
            {theme === 'lemonade' ? 'Switch to Dark' : 'Switch to Light'}
          </button>
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

        {/* Form */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="input input-bordered"
                  required
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Date of Birth</span>
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="input input-bordered"
                  required
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Medical Notes</span>
                </label>
                <textarea
                  name="medicalNotes"
                  value={formData.medicalNotes}
                  onChange={handleChange}
                  className="textarea textarea-bordered"
                  rows="4"
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Medical Report (PDF)</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="file-input file-input-bordered"
                />
              </div>
              <div className="form-control mt-6">
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Success Modal */}
        {isModalOpen && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h2 className="text-lg font-bold mb-4">Success</h2>
              <p>{successMessage}</p>
              <div className="modal-action">
                <button onClick={closeModal} className="btn btn-primary">
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElderRegistrationForm;