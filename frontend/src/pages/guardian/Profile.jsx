import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api";
import jsPDF from 'jspdf';

const Profile = () => {
  const { auth, logout, loading, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [elders, setElders] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    address: "",
    password: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [deletingElderId, setDeletingElderId] = useState(null);

  useEffect(() => {
    if (!loading && !auth) {
      navigate("/login");
    }
  }, [auth, loading, navigate]);

  useEffect(() => {
    const fetchElders = async () => {
      try {
        if (auth?._id) {
          const res = await api.get(`/elders/guardian/${auth._id}`);
          setElders(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch elders:", err);
      }
    };
    fetchElders();
  }, [auth]);

  // Initialize edit form with current auth data
  useEffect(() => {
    if (auth) {
      setEditFormData({
        name: auth.name || "",
        email: auth.email || "",
        username: auth.username || "",
        phone: auth.phone || "",
        address: auth.address || "",
        password: ""
      });
    }
  }, [auth]);

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open edit modal
  const openEditModal = () => {
    setIsEditModalOpen(true);
    setUpdateMessage("");
  };

  // Close edit modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setUpdateMessage("");
    // Reset form to current auth data
    if (auth) {
      setEditFormData({
        name: auth.name || "",
        email: auth.email || "",
        username: auth.username || "",
        phone: auth.phone || "",
        address: auth.address || "",
        password: ""
      });
    }
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage("");

    try {
      // Prepare update data (exclude empty password)
      const updateData = { ...editFormData };
      if (!updateData.password) {
        delete updateData.password;
      }

      const response = await api.put('/guardians/updateProfile', updateData);
      
      // Update auth context with new data
      setAuth(response.data);
      
      setUpdateMessage("Profile updated successfully!");
      setTimeout(() => {
        closeEditModal();
      }, 1500);
      
    } catch (error) {
      console.error("Failed to update profile:", error);
      setUpdateMessage(
        error.response?.data?.message || "Failed to update profile. Please try again."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle elder deletion
  const handleDeleteElder = async (elderId, elderName) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm(
      `Are you sure you want to delete ${elderName}'s record? This action cannot be undone.`
    );

    if (!isConfirmed) return;

    setDeletingElderId(elderId);

    try {
      // Make API call to delete elder
      await api.delete(`/elders/${elderId}`);
      
      // Remove elder from local state
      setElders(prevElders => prevElders.filter(elder => elder._id !== elderId));
      
    } catch (error) {
      console.error("Failed to delete elder:", error);
      alert("Failed to delete elder. Please try again.");
    } finally {
      setDeletingElderId(null);
    }
  };

  // PDF Download Function
  const downloadElderPDF = (elder) => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Helper function to add text with line wrapping
    const addWrappedText = (text, x, y, maxWidth, lineHeight = 6) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line, index) => {
        doc.text(line, x, y + (index * lineHeight));
      });
      return y + (lines.length * lineHeight);
    };

    // Header
    doc.setFontSize(18);
    doc.setTextColor(255, 140, 0); // Orange color
    doc.text('Elder Care Report', 20, yPosition);
    yPosition += 15;

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 20;

    // Guardian Information
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Guardian Information', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.text(`Name: ${auth.name}`, 25, yPosition);
    yPosition += 7;
    doc.text(`Email: ${auth.email}`, 25, yPosition);
    yPosition += 7;
    doc.text(`Phone: ${auth.phone}`, 25, yPosition);
    yPosition += 7;
    yPosition = addWrappedText(`Address: ${auth.address}`, 25, yPosition, 160);
    yPosition += 15;

    // Elder Information
    doc.setFontSize(14);
    doc.setTextColor(255, 140, 0);
    doc.text('Elder Information', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Full Name: ${elder.fullName}`, 25, yPosition);
    yPosition += 7;
    
    doc.text(`Status: ${formatStatus(elder.status)}`, 25, yPosition);
    yPosition += 7;

    if (elder.age) {
      doc.text(`Age: ${elder.age}`, 25, yPosition);
      yPosition += 7;
    }

    if (elder.gender) {
      doc.text(`Gender: ${elder.gender}`, 25, yPosition);
      yPosition += 7;
    }

    if (elder.medicalConditions) {
      yPosition = addWrappedText(`Medical Conditions: ${elder.medicalConditions}`, 25, yPosition, 160);
      yPosition += 5;
    }

    if (elder.emergencyContact) {
      yPosition = addWrappedText(`Emergency Contact: ${elder.emergencyContact}`, 25, yPosition, 160);
      yPosition += 5;
    }

    if (elder.specialRequirements) {
      yPosition = addWrappedText(`Special Requirements: ${elder.specialRequirements}`, 25, yPosition, 160);
      yPosition += 5;
    }

    // Rejection reason if applicable
    if (elder.status === "REJECTED" && elder.rejectionReason) {
      yPosition += 5;
      doc.setTextColor(255, 0, 0);
      yPosition = addWrappedText(`Rejection Reason: ${elder.rejectionReason}`, 25, yPosition, 160);
      doc.setTextColor(0, 0, 0);
    }

    yPosition += 15;

    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    // Caretaker Information
    doc.setFontSize(14);
    doc.setTextColor(255, 140, 0);
    doc.text('Caretaker Information', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    if (elder.caretaker && elder.caretaker.staff) {
      const caretaker = elder.caretaker.staff;
      doc.text(`Name: ${caretaker.name}`, 25, yPosition);
      yPosition += 7;
      doc.text(`Email: ${caretaker.email}`, 25, yPosition);
      yPosition += 7;
      doc.text(`Phone: ${caretaker.phone}`, 25, yPosition);
      yPosition += 7;
      
      if (caretaker.specialization) {
        doc.text(`Specialization: ${caretaker.specialization}`, 25, yPosition);
        yPosition += 7;
      }

      if (caretaker.experience) {
        doc.text(`Experience: ${caretaker.experience}`, 25, yPosition);
        yPosition += 7;
      }

      // Assignment date if available
      if (elder.caretaker.assignedAt) {
        doc.text(`Assigned Date: ${new Date(elder.caretaker.assignedAt).toLocaleDateString()}`, 25, yPosition);
        yPosition += 7;
      }
    } else {
      doc.setTextColor(100, 100, 100);
      doc.text('No caretaker assigned yet', 25, yPosition);
      yPosition += 7;
    }

    // Footer
    yPosition = pageHeight - 20;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This document is generated automatically by Elder Care Management System', 20, yPosition);

    // Save the PDF
    doc.save(`${elder.fullName.replace(/\s+/g, '_')}_elder_report.pdf`);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg text-orange-500"></div>
        <p className="mt-4 text-gray-600">Loading your profile...</p>
      </div>
    </div>
  );
  
  if (!auth) return null;

  const formatStatus = (status) => {
    switch (status) {
      case "APPROVED_AWAITING_PAYMENT":
        return "Approved – awaiting caretaker assign";
      case "DISABLED_PENDING_REVIEW":
        return "Pending Review";
      case "PAYMENT_SUCCESS":
        return "Payment Successful";
      case "ACTIVE":
        return "Active";
      case "REJECTED":
        return "Rejected";
      default:
        return status;
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-600 font-semibold";
      case "REJECTED":
        return "text-red-600 font-semibold";
      case "APPROVED_AWAITING_PAYMENT":
        return "text-yellow-600 font-semibold";
      case "DISABLED_PENDING_REVIEW":
        return "text-gray-600 font-semibold";
      case "PAYMENT_SUCCESS":
        return "text-blue-600 font-semibold";
      default:
        return "text-gray-800";
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "ACTIVE":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "REJECTED":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "APPROVED_AWAITING_PAYMENT":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "DISABLED_PENDING_REVIEW":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case "PAYMENT_SUCCESS":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your elderly care services</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="avatar placeholder">
                <div className="bg-orange-500 text-white rounded-full w-12">
                  <span className="text-lg font-bold">
                    {auth.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-900">{auth.name}</p>
                <p className="text-sm text-gray-500">Guardian</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Profile Information Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-8 text-center">
                <div className="avatar placeholder mb-4">
                  <div className="bg-white text-orange-500 rounded-full w-20">
                    <span className="text-2xl font-bold">
                      {auth.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {auth.name}
                </h2>
                <p className="text-orange-100">Guardian Account</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{auth.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{auth.phone}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">{auth.address}</p>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    onClick={openEditModal}
                    className="btn btn-outline btn-primary w-full"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                  
                  <Link
                    to="/elder-register"
                    className="btn btn-primary bg-orange-500 hover:bg-orange-600 border-orange-500 hover:border-orange-600 w-full text-white"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Request Elder Account
                  </Link>
                  
                  <button
                    onClick={logout}
                    className="btn btn-outline btn-error w-full"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Elders Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">My Elders</h3>
                    <p className="text-gray-600 mt-1">
                      {elders.length === 0 ? "No elders registered yet" : `Managing ${elders.length} elder${elders.length > 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <div className="stats bg-white shadow">
                    <div className="stat">
                      <div className="stat-title text-xs">Total Elders</div>
                      <div className="stat-value text-orange-500 text-2xl">{elders.length}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {elders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Elders Yet</h4>
                    <p className="text-gray-600 mb-6">Start by registering your first elder to begin managing their care.</p>
                    <Link
                      to="/elder-register"
                      className="btn bg-orange-500 hover:bg-orange-600 text-white border-none"
                    >
                      Register First Elder
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {elders.map((elder) => (
                      <div
                        key={elder._id}
                        className="card bg-gradient-to-r from-white to-orange-50 shadow-md border border-orange-100 hover:shadow-lg transition-shadow"
                      >
                        <div className="card-body">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="avatar placeholder">
                                  <div className="bg-orange-200 text-orange-700 rounded-full w-12">
                                    <span className="font-bold">
                                      {elder.fullName?.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-xl font-bold text-gray-900">
                                    {elder.fullName}
                                  </h4>
                                  <div className={getStatusBadge(elder.status)}>
                                    {formatStatus(elder.status)}
                                  </div>
                                </div>
                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                  {/* PDF Download Button */}
                                  <button
                                    onClick={() => downloadElderPDF(elder)}
                                    className="btn btn-outline btn-sm bg-orange-500 hover:bg-orange-600 text-white border-orange-500 hover:border-orange-600"
                                    title="Download Elder Report"
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    PDF
                                  </button>
                                  
                                  {/* Delete Button - Only show for rejected elders */}
                                  {elder.status === "REJECTED" && (
                                    <button
                                      onClick={() => handleDeleteElder(elder._id, elder.fullName)}
                                      className={`btn btn-outline btn-sm btn-error ${deletingElderId === elder._id ? 'loading' : ''}`}
                                      disabled={deletingElderId === elder._id}
                                      title="Delete Elder Record"
                                    >
                                      {deletingElderId === elder._id ? (
                                        <span className="loading loading-spinner loading-xs"></span>
                                      ) : (
                                        <>
                                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                          Delete
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {elder.status === "REJECTED" && elder.rejectionReason && (
                                <div className="alert alert-error mb-4">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-sm">
                                    <strong>Rejection Reason:</strong> {elder.rejectionReason}
                                  </span>
                                </div>
                              )}

                              <div className="bg-white rounded-lg p-4 border border-orange-100">
                                <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                                  <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  Assigned Caretaker
                                </h5>
                                
                                {elder.caretaker ? (
                                  <div className="flex items-center space-x-4 bg-green-50 p-3 rounded-lg border border-green-200">
                                    <div className="avatar placeholder">
                                      <div className="bg-green-500 text-white rounded-full w-10">
                                        <span className="text-sm font-bold">
                                          {elder.caretaker.staff?.name?.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">
                                        {elder.caretaker.staff?.name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {elder.caretaker.staff?.email}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        📞 {elder.caretaker.staff?.phone}
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                      </svg>
                                    </div>
                                    <p className="text-gray-600">
                                      No caretaker assigned yet. We'll notify you once a caretaker is available.
                                    </p>
                                  </div>
                                )}
                              </div>
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

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Profile</h3>
              <button
                onClick={closeEditModal}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {updateMessage && (
              <div className={`alert mb-4 ${updateMessage.includes('success') ? 'alert-success' : 'alert-error'}`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{updateMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-gray-900">Full Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  className="input input-bordered w-full bg-orange-100 text-gray-800"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium  text-gray-900">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  className="input input-bordered w-full  bg-orange-100 text-gray-800"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium  text-gray-900">Phone Number</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditInputChange}
                  className="input input-bordered w-full  bg-orange-100 text-gray-800"
                  pattern="[0-9]{10,15}"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium  text-gray-900">Address</span>
                </label>
                <textarea
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditInputChange}
                  className="textarea textarea-bordered w-full  bg-orange-100 text-gray-800"
                  rows={3}
                  required
                />
              </div>


              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="btn border-orange-400 bg-slate-100 text-gray-700 flex-1  hover:bg-gray-600 "
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn bg-orange-500 hover:bg-orange-600 text-white flex-1 ${isUpdating ? 'loading' : ''}`}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={closeEditModal}></div>
        </div>
      )}
    </div>
  );
};

export default Profile;