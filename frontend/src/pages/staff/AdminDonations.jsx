import React, { useEffect, useState } from "react";
import api from "../../api";
import { ToastContainer, toast } from "react-toastify";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    pendingCount: 0,
    receivedCount: 0
  });

  const fetchData = async () => {
    try {
      const donationsRes = await api.get("/donations");
      if (donationsRes.data.length > donations.length) {
        toast.info("New donation received!");
      }
      setDonations(donationsRes.data);

      // Calculate stats
      const totalDonations = donationsRes.data.length;
      const totalAmount = donationsRes.data
        .filter(d => d.donationType === 'cash')
        .reduce((sum, d) => sum + (d.amount || 0), 0);
      const pendingCount = donationsRes.data.filter(d => d.status === 'pending').length;
      const receivedCount = donationsRes.data.filter(d => d.status === 'received').length;

      setStats({ totalDonations, totalAmount, pendingCount, receivedCount });

      const donorsRes = await api.get("/donors");
      setDonors(donorsRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Error fetching data");
      toast.error(err.response?.data?.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up polling every 10 seconds
    const intervalId = setInterval(fetchData, 10000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [donations.length]); // Include donations.length to trigger toast on new donations

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/donations/${id}`, { status: newStatus });
      setDonations((prev) =>
        prev.map((donation) =>
          donation._id === id ? { ...donation, status: newStatus } : donation
        )
      );
      toast.success(`Status updated to "${newStatus}"`);
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Error updating status");
    }
  };

  const handleAddToDonorList = async (id, checked) => {
    try {
      await api.put(`/donations/${id}`, { addToDonorList: checked });
      setDonations((prev) =>
        prev.map((donation) =>
          donation._id === id ? { ...donation, addToDonorList: checked } : donation
        )
      );

      // Refresh donor list
      const donorsRes = await api.get("/donors");
      setDonors(donorsRes.data);

      toast.success(
        checked ? "Added to donor list ✅" : "Removed from donor list ❌"
      );
    } catch (err) {
      console.error("Donor list update error:", err);
      toast.error("Error updating donor list");
    }
  };

  const handleDeleteDonation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this donation?")) return;

    try {
      await api.post(`/donations/delete/${id}`);
      setDonations((prev) => prev.filter((donation) => donation._id !== id));
      toast.success("Donation deleted successfully");
    } catch (err) {
      console.error("Delete donation error:", err);
      toast.error("Error deleting donation");
    }
  };

  const downloadDonorListCSV = () => {
    if (donors.length === 0) {
      toast.warn("No donors to export");
      return;
    }

    const headers = ["#", "Name", "Donation Date"];
    const rows = donors.map((d, index) => [
      index + 1,
      d.donorName,
      d.donationDate ? new Date(d.donationDate).toLocaleDateString() : "-",
    ]);
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "donor_list.csv");
  };

  const downloadDonorListPDF = () => {
    if (donors.length === 0) {
      toast.warn("No donors to export");
      return;
    }

    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Our Monthly Donors", 14, 20);

      if (!doc.autoTable) {
        throw new Error("autoTable plugin not loaded");
      }

      const tableColumn = ["#", "Name", "Donation Date"];
      const tableRows = donors.map((donor, index) => [
        index + 1,
        donor.donorName,
        donor.donationDate ? new Date(donor.donationDate).toLocaleDateString() : "-",
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [245, 101, 57], textColor: 255 }, // Orange color
        alternateRowStyles: { fillColor: [255, 247, 237] }, // Light orange
      });

      doc.save("monthly_donor_list.pdf");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error(`Error generating PDF: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xl font-semibold text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <ToastContainer />

      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                Donations Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Manage and track all donations in real-time</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 font-medium">Live Updates</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Donations</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalDonations}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-3xl font-bold text-green-600">${stats.totalAmount.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7.07,18.28C7.5,17.38 10.12,16.5 12,16.5C13.88,16.5 16.5,17.38 16.93,18.28C15.57,19.36 13.86,20 12,20C10.14,20 8.43,19.36 7.07,18.28M18.36,16.83C16.93,15.09 13.46,14.5 12,14.5C10.54,14.5 7.07,15.09 5.64,16.83C4.62,15.5 4,13.82 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,13.82 19.38,15.5 18.36,16.83M12,6C10.06,6 8.5,7.56 8.5,9.5C8.5,11.44 10.06,13 12,13C13.94,13 15.5,11.44 15.5,9.5C15.5,7.56 13.94,6 12,6M12,11A1.5,1.5 0 0,1 10.5,9.5A1.5,1.5 0 0,1 12,8A1.5,1.5 0 0,1 13.5,9.5A1.5,1.5 0 0,1 12,11Z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Received</p>
                <p className="text-3xl font-bold text-green-600">{stats.receivedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Donations Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              All Donations
            </h2>
            <p className="text-orange-100 mt-1">Manage and track donation status</p>
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left font-semibold text-gray-700">Donor</th>
                  <th className="text-left font-semibold text-gray-700">Contact</th>
                  <th className="text-left font-semibold text-gray-700">Type</th>
                  <th className="text-left font-semibold text-gray-700">Amount/Item</th>
                  <th className="text-center font-semibold text-gray-700">Qty</th>
                  <th className="text-center font-semibold text-gray-700">Public</th>
                  <th className="text-center font-semibold text-gray-700">Status</th>
                  <th className="text-center font-semibold text-gray-700">Payment ID</th>
                  <th className="text-center font-semibold text-gray-700">Donor List</th>
                  <th className="text-center font-semibold text-gray-700">Date</th>
                  <th className="text-center font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation, index) => (
                  <tr key={donation._id} className={`hover:bg-orange-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="font-medium text-gray-900">{donation.donorName}</td>
                    <td className="text-gray-600 max-w-[150px] truncate">{donation.donorEmail}</td>
                    <td>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${donation.donationType === 'cash'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                        }`}>
                        {donation.donationType === 'cash' ? '💰 Cash' : '📦 Item'}
                      </span>
                    </td>
                    <td className="font-semibold text-gray-900">
                      {donation.donationType === "cash"
                        ? `$${donation.amount?.toLocaleString()}`
                        : donation.itemName}
                    </td>
                    <td className="text-center text-gray-600">
                      {donation.donationType === "item" ? donation.quantity : "-"}
                    </td>
                    <td className="text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${donation.listAcknowledgment
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                        }`}>
                        {donation.listAcknowledgment ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="text-center">
                      <select
                        value={donation.status}
                        onChange={(e) =>
                          handleStatusChange(donation._id, e.target.value)
                        }
                        className="select select-bordered select-sm bg-white border-orange-200 focus:border-orange-500 rounded-lg"
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="received">✅ Received</option>
                      </select>
                    </td>
                    <td className="text-center text-gray-600 text-sm max-w-[150px] break-words">
                      {donation.paymentId || "-"}
                    </td>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        checked={donation.addToDonorList || false}
                        onChange={(e) =>
                          handleAddToDonorList(donation._id, e.target.checked)
                        }
                        className="checkbox checkbox-warning"
                      />
                    </td>
                    <td className="text-center text-gray-600 text-sm">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleDeleteDonation(donation._id)}
                        className="btn btn-sm bg-red-100 hover:bg-red-200 text-red-600 border-red-200 hover:border-red-300 rounded-lg transition-all duration-200"
                        title="Delete donation"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {donations.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No donations yet</p>
            </div>
          )}
        </div>

        {/* Donor List Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.99 2.99 0 0 0 16.85 6c-.47 0-.91.17-1.25.47L14 7.75V12c0 1.11-.89 2-2 2s-2-.89-2-2V5c0-1.11.89-2 2-2s2 .89 2 2v3l4.05-2.76c.85-.58 2-.58 2.85 0L22 8v14h-2z" />
                </svg>
                Public Donor List
              </h2>
              <p className="text-orange-100 mt-1">Export and manage public donor recognition</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={downloadDonorListCSV}
                className="btn bg-white text-orange-600 hover:bg-orange-50 border-white hover:border-orange-100 rounded-lg shadow-lg transition-all duration-200"
              >
                📄 CSV
              </button>
              <button
                onClick={downloadDonorListPDF}
                className="btn bg-orange-700 text-white hover:bg-orange-800 border-orange-700 hover:border-orange-800 rounded-lg shadow-lg transition-all duration-200"
              >
                📑 PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left font-semibold text-gray-700">#</th>
                  <th className="text-left font-semibold text-gray-700">Donor Name</th>
                  <th className="text-center font-semibold text-gray-700">Donation Date</th>
                  <th className="text-center font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {donors.map((donor, index) => (
                  <tr key={donor._id} className={`hover:bg-orange-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="font-semibold text-gray-700">{index + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {donor.donorName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{donor.donorName}</span>
                      </div>
                    </td>
                    <td className="text-center text-gray-600">
                      {donor.donationDate
                        ? new Date(donor.donationDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={async () => {
                          if (!window.confirm("Are you sure you want to remove this donor from the public list?")) return;
                          try {
                            await api.delete(`/donors/${donor._id}`);
                            setDonors((prev) => prev.filter((d) => d._id !== donor._id));
                            toast.success("Donor removed from list successfully");
                          } catch (err) {
                            console.error("Delete donor error:", err);
                            toast.error("Error removing donor");
                          }
                        }}
                        className="btn btn-sm bg-red-100 hover:bg-red-200 text-red-600 border-red-200 hover:border-red-300 rounded-lg transition-all duration-200"
                        title="Remove from donor list"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {donors.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.99 2.99 0 0 0 16.85 6c-.47 0-.91.17-1.25.47L14 7.75V12c0 1.11-.89 2-2 2s-2-.89-2-2V5c0-1.11.89-2 2-2s2 .89 2 2v3l4.05-2.76c.85-.58 2-.58 2.85 0L22 8v14h-2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No public donors yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDonations;