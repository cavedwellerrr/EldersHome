import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const ElderRegistrationForm = () => {
  const { auth } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: '',
    address: '',
    medicalNotes: '',
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setError(null);
    } else {
      setPdfFile(null);
      setError('Please select a valid PDF file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (pdfFile) {
        data.append('pdf', pdfFile);
      }
      await axios.post('http://localhost:5000/api/elders', data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Elder registration request submitted successfully');
      setError(null);
      // Reset form after successful submission
      setFormData({
        fullName: '',
        dob: '',
        gender: '',
        address: '',
        medicalNotes: '',
      });
      setPdfFile(null);
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data?.message || 'Failed to submit elder registration');
      setSuccess(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="btn btn-ghost text-orange-600 hover:bg-orange-100"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Register Elder</h1>
                <p className="text-gray-600 mt-1">Add a new elder to your care network</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="avatar placeholder">
                <div className="bg-orange-500 text-white rounded-full w-12">
                  <span className="text-lg font-bold">
                    {auth?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-900">{auth?.name}</p>
                <p className="text-sm text-gray-500">Guardian</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          
          {/* Left Side - Information Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Elder Care Registration</h3>
                  <p className="text-gray-600">Providing quality care for your loved ones</p>
                </div>
              </div>
              
              <div className="prose prose-sm text-gray-600">
                <p className="mb-4">
                  Register your elderly family member to access our comprehensive care services. 
                  Our professional caregivers are dedicated to ensuring the wellbeing and happiness 
                  of your loved ones.
                </p>
              </div>
            </div>

            {/* Features Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
              <h4 className="text-lg font-bold text-gray-900 mb-4">What We Provide</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">24/7 Professional Care</p>
                    <p className="text-sm text-gray-600">Round-the-clock care from qualified professionals</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Medical Support</p>
                    <p className="text-sm text-gray-600">Healthcare monitoring and medication management</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Regular Updates</p>
                    <p className="text-sm text-gray-600">Stay informed about your loved one's wellbeing</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Comfortable Environment</p>
                    <p className="text-sm text-gray-600">Safe and homely care environment</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
              <h4 className="text-lg font-bold mb-4">Need Help?</h4>
              <p className="text-orange-100 mb-4">
                Our support team is here to assist you with the registration process.
              </p>
              <div className="flex items-center space-x-2 text-orange-100">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-orange-100">
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-8 py-6 border-b border-orange-200">
                <h3 className="text-2xl font-bold text-gray-900">Registration Form</h3>
                <p className="text-gray-600 mt-1">Please fill in all the required information</p>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Full Name */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base font-semibold text-gray-700">Full Name *</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      required
                      className="input input-bordered w-full pl-10 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base font-semibold text-gray-700">Date of Birth *</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      min={(() => {
                        const today = new Date();
                        const ninetyYearsAgo = new Date(today.getFullYear() - 90, today.getMonth(), today.getDate());
                        return ninetyYearsAgo.toISOString().split('T')[0];
                      })()}
                      max={(() => {
                        const today = new Date();
                        const fortyFiveYearsAgo = new Date(today.getFullYear() - 45, today.getMonth(), today.getDate());
                        return fortyFiveYearsAgo.toISOString().split('T')[0];
                      })()}
                      required
                      className="input input-bordered w-full pl-10 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                  <label className="label">
                    <span className="label-text-alt text-gray-500">Age must be between 45-90 years old</span>
                  </label>
                </div>

                {/* Gender */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base font-semibold text-gray-700">Gender *</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      className="select select-bordered w-full pl-10 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base font-semibold text-gray-700">Address *</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter complete address"
                      required
                      rows="3"
                      className="textarea textarea-bordered w-full pl-10 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 resize-none"
                    />
                  </div>
                </div>

                {/* Medical Notes */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base font-semibold text-gray-700">Medical Notes *</span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <textarea
                      name="medicalNotes"
                      value={formData.medicalNotes}
                      onChange={handleChange}
                      placeholder="Please describe any medical conditions, medications, or special care requirements"
                      required
                      rows="4"
                      className="textarea textarea-bordered w-full pl-10 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 resize-none"
                    />
                  </div>
                </div>

                {/* PDF Upload */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base font-semibold text-gray-700">Medical Records (PDF)</span>
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-orange-300 border-dashed rounded-lg cursor-pointer bg-orange-50 hover:bg-orange-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-orange-500" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-700">
                          <span className="font-semibold">Click to upload</span> medical records
                        </p>
                        <p className="text-xs text-gray-500">PDF files only (MAX. 10MB)</p>
                        {pdfFile && (
                          <p className="text-xs text-orange-600 mt-2 font-medium">
                            Selected: {pdfFile.name}
                          </p>
                        )}
                      </div>
                      <input
                        type="file"
                        name="pdf"
                        onChange={handleFileChange}
                        accept="application/pdf"
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="btn bg-orange-500 hover:bg-orange-600 text-white border-none w-full text-lg h-12"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Submit Registration
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {success && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success bg-green-500 text-white rounded-xl shadow-lg border-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{success}</span>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default ElderRegistrationForm;