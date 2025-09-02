import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const ElderRegistrationForm = () => {
  const { auth } = useContext(AuthContext); // get logged-in guardian info
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: '',
    address: '',
    age: '',
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send the request including credentials (cookies)
      await axios.post('http://localhost:5000/api/elders', formData, {
        withCredentials: true, // important: sends cookies for session-based auth
      });
      alert('Elder registration request submitted successfully');
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data?.message || 'Failed to submit elder registration');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        placeholder="Full Name"
        required
      />
      <input
        type="date"
        name="dob"
        value={formData.dob}
        onChange={handleChange}
        placeholder="Date of Birth"
        required
      />
      <input
        type="text"
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        placeholder="Gender"
        required
      />
      <input
        type="text"
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Address"
        required
      />
      <input
        type="medicalNotes"
        name="medicalNotes"
        value={formData.medicalNotes}
        onChange={handleChange}
        placeholder="medicalNotes"
        required
      />
      <button type="submit">Submit</button>
      {error && <p>{error}</p>}
    </form>
  );
};

export default ElderRegistrationForm;
