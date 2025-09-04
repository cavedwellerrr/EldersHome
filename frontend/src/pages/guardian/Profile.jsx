import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Modal from "react-modal";
import axios from "axios";

// Bind modal to app element for accessibility
Modal.setAppElement("#root");

const Profile = () => {
  const { auth, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // State for modal and form
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    elderName: "",
    dob: "",
    gender: "",
    medicalNotes: "",
  });
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !auth) {
      // Redirect to login if not logged in
      navigate("/login");
    }
  }, [auth, loading, navigate]);

  // Open/close modal
  const openModal = () => setModalIsOpen(true);
  const closeModal = () => {
    setModalIsOpen(false);
    setFormData({ elderName: "", dob: "", gender: "", medicalNotes: "" });
    setFiles([]);
    setMessage("");
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("elderName", formData.elderName);
    data.append("dob", formData.dob);
    data.append("gender", formData.gender);
    data.append("medicalNotes", formData.medicalNotes);
    for (let i = 0; i < files.length; i++) {
      data.append("medicalFiles", files[i]);
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/guardians/submit-elder-request",
        data,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`, // Use token from AuthContext
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage(res.data.message);
      closeModal(); // Close modal on success
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error submitting elder request"
      );
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!auth) return null; // Will redirect anyway

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Welcome, {auth.name}</h2>
      <p>Email: {auth.email}</p>
      <p>Phone: {auth.phone}</p>
      <p>Address: {auth.address}</p>
      <div className="mt-4 space-x-4">
        <button
          onClick={openModal}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-500"
        >
          Submit Elder Request
        </button>
        <button
          onClick={logout}
          className="bg-red-600 text-white p-2 rounded hover:bg-red-500"
        >
          Logout
        </button>
      </div>

      {/* Modal for Elder Request Form */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="max-w-lg mx-auto mt-20 p-6 bg-white border rounded shadow"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <h2 className="text-2xl font-bold mb-4">Elder Request Form</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Elder Name:</label>
            <input
              type="text"
              name="elderName"
              value={formData.elderName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Date of Birth:</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Gender:</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Medical Notes:</label>
            <textarea
              name="medicalNotes"
              value={formData.medicalNotes}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Medical Files:</label>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="w-full p-2"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={closeModal}
              className="bg-gray-600 text-white p-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white p-2 rounded hover:bg-green-500"
            >
              Submit
            </button>
          </div>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
      </Modal>
    </div>
  );
};

export default Profile;