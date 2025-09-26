import React, { useEffect, useState } from "react";
import axios from "axios";

const AssignCaretaker = () => {
  const [elders, setElders] = useState([]);
  const [caretakers, setCaretakers] = useState([]);
  const [selectedCaretaker, setSelectedCaretaker] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assigningElder, setAssigningElder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedElderForAssign, setSelectedElderForAssign] = useState(null);
  const [selectedCaretakerDetails, setSelectedCaretakerDetails] = useState(null);

  const API_URL = "http://localhost:5000/api";

  // Fetch active elders and caretakers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");

        const [resElders, resCaretakers] = await Promise.all([
          axios.get(`${API_URL}/elders/active`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/staff/caretakers`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        setElders(resElders.data);
        setCaretakers(resCaretakers.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleAssign = async (elderId) => {
    try {
      setIsAssigning(true);
      setAssigningElder(elderId);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");
      const caretakerId = selectedCaretaker[elderId];

      const res = await axios.post(
        `${API_URL}/caretakers/assign`,
        { caretakerId, elderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message);

      // Remove assigned elder from list or refresh data
      setElders(elders.filter(elder => elder._id !== elderId));

      // Clear selection for this elder
      const newSelection = { ...selectedCaretaker };
      delete newSelection[elderId];
      setSelectedCaretaker(newSelection);

    } catch (err) {
      setError(err.response?.data?.message || "Error assigning caretaker");
    } finally {
      setIsAssigning(false);
      setAssigningElder(null);
    }
  };

  const openAssignModal = (elder) => {
    setSelectedElderForAssign(elder);
    setSelectedCaretakerDetails(null);
    setIsModalOpen(true);
  };

  const selectCaretakerInModal = (caretaker) => {
    setSelectedCaretakerDetails(caretaker);
    setSelectedCaretaker({
      ...selectedCaretaker,
      [selectedElderForAssign._id]: caretaker._id,
    });
  };

  const confirmAssignment = () => {
    if (selectedElderForAssign && selectedCaretakerDetails) {
      handleAssign(selectedElderForAssign._id);
      setIsModalOpen(false);
    }
  };

  const getUnassignedElders = () => elders.filter(elder => !elder.assignedCaretaker);
  const getAvailableCaretakers = () => caretakers.filter(ct => ct.isAvailable !== false);
  const getAssignedCount = () => elders.filter(elder => elder.assignedCaretaker).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Assign Caretakers</h1>
              <p className="text-gray-600 mt-1">Match elders with suitable caretakers</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="avatar placeholder">
                <div className="bg-orange-500 text-white rounded-full w-12">
                  <span className="text-lg font-bold">AC</span>
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Operator</p>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Unassigned Elders</p>
                <p className="text-2xl font-bold text-gray-900">{getUnassignedElders().length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Available Caretakers</p>
                <p className="text-2xl font-bold text-gray-900">{getAvailableCaretakers().length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Assigned Today</p>
                <p className="text-2xl font-bold text-gray-900">{getAssignedCount()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Elders</p>
                <p className="text-2xl font-bold text-gray-900">{elders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Elders Needing Assignment */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-orange-100">
              <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Elders Needing Caretakers</h3>
                    <p className="text-gray-600 mt-1">Select elders to assign caretakers</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-orange-600">{getUnassignedElders().length}</span>
                    <p className="text-sm text-gray-500">Pending</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <div className="loading loading-spinner loading-lg text-orange-500"></div>
                      <p className="mt-4 text-gray-600">Loading elders...</p>
                    </div>
                  </div>
                ) : getUnassignedElders().length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">All Elders Assigned</h4>
                    <p className="text-gray-600">Great! All active elders have been assigned caretakers.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {getUnassignedElders().map((elder) => (
                      <div
                        key={elder._id}
                        className="bg-gradient-to-r from-white to-orange-50 rounded-xl shadow-md border border-orange-100 hover:shadow-lg transition-shadow p-6"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="avatar placeholder">
                              <div className="bg-orange-200 text-orange-700 rounded-full w-16">
                                <span className="text-lg font-bold">
                                  {elder.fullName?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-gray-900">{elder.fullName}</h4>
                              <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Age:</span> {elder.dob ? new Date().getFullYear() - new Date(elder.dob).getFullYear() : 'N/A'}
                                </div>
                                <div>
                                  <span className="font-medium">Gender:</span> {elder.gender || 'N/A'}
                                </div>
                              </div>
                              {elder.medicalNotes && (
                                <p className="text-sm text-gray-600 mt-2">
                                  <span className="font-medium">Medical Notes:</span> {elder.medicalNotes.substring(0, 100)}...
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => openAssignModal(elder)}
                              className="btn bg-orange-500 hover:bg-orange-600 text-white border-none"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Assign Caretaker
                            </button>

                            {/* Quick Assign Dropdown */}
                            <div className="flex items-center space-x-2">
                              <select
                                value={selectedCaretaker[elder._id] || ""}
                                onChange={(e) => {
                                  setSelectedCaretaker({
                                    ...selectedCaretaker,
                                    [elder._id]: e.target.value,
                                  });
                                }}
                                className="select select-bordered select-sm text-xs"
                              >
                                <option value="">Quick Select</option>
                                {getAvailableCaretakers().map((ct) => (
                                  <option key={ct._id} value={ct._id}>
                                    {ct.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleAssign(elder._id)}
                                disabled={!selectedCaretaker[elder._id] || (isAssigning && assigningElder === elder._id)}
                                className={`btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none ${!selectedCaretaker[elder._id] ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                              >
                                {isAssigning && assigningElder === elder._id ? (
                                  <div className="loading loading-spinner loading-xs"></div>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Available Caretakers Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-orange-100">
              <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Available Caretakers</h3>
                <p className="text-gray-600 mt-1">{getAvailableCaretakers().length} ready to assign</p>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                {getAvailableCaretakers().length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600">No available caretakers</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {getAvailableCaretakers().map((caretaker) => (
                      <div
                        key={caretaker._id}
                        className="bg-gradient-to-r from-white to-green-50 rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="avatar placeholder">
                            <div className="bg-green-200 text-green-700 rounded-full w-10">
                              <span className="text-sm font-bold">
                                {caretaker.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 text-sm">{caretaker.name}</h5>
                            <p className="text-xs text-gray-600">{caretaker.specialization || 'General Care'}</p>
                            <div className="flex items-center mt-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                              <span className="text-xs text-green-600 font-medium">Available</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {isModalOpen && selectedElderForAssign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-96 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Assign Caretaker to {selectedElderForAssign.fullName}
              </h2>
              <p className="text-gray-600 mt-1">Select the best caretaker for this elder</p>
            </div>

            <div className="p-6 max-h-80 overflow-y-auto">
              <div className="grid gap-3">
                {getAvailableCaretakers().map((caretaker) => (
                  <div
                    key={caretaker._id}
                    onClick={() => selectCaretakerInModal(caretaker)}
                    className={`rounded-lg p-4 border-2 cursor-pointer transition-all ${selectedCaretakerDetails?._id === caretaker._id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300 bg-white hover:bg-orange-50'
                      }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="avatar placeholder">
                        <div className={`rounded-full w-12 ${selectedCaretakerDetails?._id === caretaker._id
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                          }`}>
                          <span className="font-bold">
                            {caretaker.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{caretaker.name}</h4>
                        <p className="text-sm text-gray-600">@{caretaker.username}</p>
                        <p className="text-sm text-gray-600">{caretaker.specialization || 'General Care'}</p>
                        <p className="text-sm text-gray-600">{caretaker.experience || 'Experienced'}</p>
                      </div>
                      {selectedCaretakerDetails?._id === caretaker._id && (
                        <div className="text-orange-500">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-ghost text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmAssignment}
                className={`btn bg-orange-500 hover:bg-orange-600 text-white border-none ${!selectedCaretakerDetails ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                disabled={!selectedCaretakerDetails}
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {message && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success bg-green-500 text-white rounded-xl shadow-lg border-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{message}</span>
            <button onClick={() => setMessage('')} className="text-white hover:text-gray-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-error bg-red-500 text-white rounded-xl shadow-lg border-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-medium">{error}</span>
            <button onClick={() => setError('')} className="text-white hover:text-gray-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignCaretaker;