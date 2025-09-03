import { useState } from 'react';

function ElderRegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: '',
    address: '',
    medicalNotes: '',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [fileError, setFileError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setFileError('Please upload a PDF file');
        setFile(null);
      } else if (selectedFile.size > 5 * 1024 * 1024) {
        setFileError('File size must be less than 5MB');
        setFile(null);
      } else {
        setFile(selectedFile);
        setFileError(null);
      }
    } else {
      setFile(null);
      setFileError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem('token');
    console.log('Token:', token || 'No token found');

    if (!token) {
      setError('Please log in to submit the form');
      return;
    }

    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('dob', formData.dob);
      data.append('gender', formData.gender);
      data.append('address', formData.address);
      data.append('medicalNotes', formData.medicalNotes);
      if (file) {
        data.append('medicalNotesFile', file);
      }

      const response = await fetch('http://localhost:5000/api/elders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `HTTP error ${response.status}`);
      }

      console.log('Success:', result);
      setFormData({ fullName: '', dob: '', gender: '', address: '', medicalNotes: '' });
      setFile(null);
      setFileError(null);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit elder registration');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="m-5 p-6 bg-white shadow-lg rounded-lg max-w-md mx-auto"
    >
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Elder Registration
      </h2>

      {/* Full Name */}
      <div className="mb-4">
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Enter full name"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Date of Birth */}
      <div className="mb-4">
        <label
          htmlFor="dob"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Date of Birth
        </label>
        <input
          type="date"
          id="dob"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Gender */}
      <div className="mb-4">
        <label
          htmlFor="gender"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Gender
        </label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="" disabled>
            Select gender
          </option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Address */}
      <div className="mb-4">
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Address
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter address"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Medical Notes (Text) */}
      <div className="mb-4">
        <label
          htmlFor="medicalNotes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Medical Notes (Text, optional)
        </label>
        <textarea
          id="medicalNotes"
          name="medicalNotes"
          value={formData.medicalNotes}
          onChange={handleChange}
          placeholder="Enter medical notes (optional)"
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
      </div>

      {/* Medical Notes (PDF) */}
      <div className="mb-4">
        <label
          htmlFor="medicalNotesFile"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Medical Notes (PDF, optional, max 5MB)
        </label>
        <input
          type="file"
          id="medicalNotesFile"
          name="medicalNotesFile"
          accept="application/pdf"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {file && (
          <p className="mt-2 text-sm text-gray-600">
            Selected file: {file.name}
          </p>
        )}
        {fileError && (
          <p className="mt-2 text-sm text-red-600">{fileError}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
      >
        Submit
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-4 text-red-600 text-sm text-center">{error}</p>
      )}
    </form>
  );
}

export default ElderRegistrationForm;