import { useEffect, useState } from "react";
import api from "../../api"; // axios instance with baseURL

const DoctorMedicalRecords = () => {
  const [records, setRecords] = useState([]); // all medical records
  const [elders, setElders] = useState([]); // list of elders for dropdown
  const [elderId, setElderId] = useState(""); // selected elder ID
  const [recordType, setRecordType] = useState("Diagnosis"); // type of record
  const [notes, setNotes] = useState(""); // doctor's notes
  const [editingId, setEditingId] = useState(null); // record ID for editing
  const [message, setMessage] = useState(""); // success/error messages

  useEffect(() => {
    fetchRecords(); // fetch all medical records
    fetchElders(); // fetch all elders for dropdown
  }, []);

  // Fetch all medical records
  const fetchRecords = async () => {
    try {
      const res = await api.get("/medicalrecords");
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching records", err);
    }
  };

  // Fetch all elders for dropdown
  const fetchElders = async () => {
    try {
      const res = await api.get("/elders");
      setElders(res.data);
    } catch (err) {
      console.error("Error fetching elders", err);
    }
  };

  // Submit new record or update existing one
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update record
        await api.patch(`/medicalrecords/${editingId}`, { recordType, notes });
        setMessage("✅ Record updated successfully");
      } else {
        // Add new record for selected elder
        await api.post(`/elders/${elderId}/medicalrecords`, {
          doctorId: localStorage.getItem("doctorId"), // must be set in localStorage
          recordType,
          notes,
        });
        setMessage("✅ Record added successfully");
      }

      // Reset form
      setElderId("");
      setNotes("");
      setRecordType("Diagnosis");
      setEditingId(null);

      // Refresh records
      fetchRecords();
    } catch (err) {
      console.error("Error saving record", err);
      setMessage("❌ Error saving record");
    }
  };

  // Fill form for editing
  const handleEdit = (record) => {
    setEditingId(record._id);
    setElderId(record.elderId?._id || "");
    setRecordType(record.recordType);
    setNotes(record.notes);
  };

  // Delete a record
  const handleDelete = async (id) => {
    try {
      await api.delete(`/medicalrecords/${id}`);
      setMessage("✅ Record deleted successfully");
      fetchRecords();
    } catch (err) {
      console.error("Error deleting record", err);
      setMessage("❌ Error deleting record");
    }
  };

  return (
    <div className="p-8 text-gray-900">
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-6 text-blue-700">📋 Medical Records</h1>

      {/* Add/Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-100 p-6 rounded-lg shadow-md flex flex-wrap items-center gap-4 mb-8"
      >
        {/* Elder Dropdown (only when adding new record) */}
        {!editingId && (
          <select
            value={elderId}
            onChange={(e) => setElderId(e.target.value)}
            required
            className="border border-blue-300 bg-blue-50 text-gray-900 rounded p-2 flex-1 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select Elder --</option>
            {elders.map((elder) => (
              <option key={elder._id} value={elder._id}>
                {elder.name || elder.fullName} {/* fallback just in case */}
              </option>
            ))}
          </select>
        )}

        {/* Record Type Dropdown */}
        <select
          value={recordType}
          onChange={(e) => setRecordType(e.target.value)}
          className="border border-blue-300 bg-blue-50 text-gray-900 rounded p-2 flex-1 focus:ring-2 focus:ring-blue-500"
        >
          <option>Diagnosis</option>
          <option>Lab Report</option>
          <option>X-Ray</option>
          <option>Other Note</option>
        </select>

        {/* Notes Input */}
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          required
          className="border border-blue-300 bg-blue-50 text-gray-900 rounded p-2 flex-1 focus:ring-2 focus:ring-blue-500"
        />

        {/* Submit Button */}
        <button
          type="submit"
          className={`px-5 py-2 rounded font-semibold text-white ${
            editingId
              ? "bg-yellow-500 hover:bg-yellow-600" // update button
              : "bg-green-600 hover:bg-green-700" // add button
          }`}
        >
          {editingId ? "Update" : "Add Record"}
        </button>
      </form>

      {/* Show success/error message */}
      {message && (
        <p className="mb-6 text-sm font-medium text-center text-blue-700">{message}</p>
      )}

      {/* Records Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow-md border border-gray-200">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-3 text-left">Elder</th>
              <th className="p-3 text-left">Record Type</th>
              <th className="p-3 text-left">Notes</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? (
              records.map((rec) => (
                <tr key={rec._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    {rec.elderId?.name || rec.elderId?.fullName || "Unknown Elder"}
                  </td>
                  <td className="p-3">{rec.recordType}</td>
                  <td className="p-3">{rec.notes}</td>
                  <td className="p-3">
                    {rec.date ? new Date(rec.date).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="p-3 text-center space-x-2">
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEdit(rec)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(rec._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="p-4 text-center text-gray-500 font-medium"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorMedicalRecords;
