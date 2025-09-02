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

  // Fetch donations and donor list
  useEffect(() => {
    const fetchData = async () => {
      try {
        const donationsRes = await api.get("/donations");
        setDonations(donationsRes.data);

        const donorsRes = await api.get("/donors");
        setDonors(donorsRes.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Status update
  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/donations/${id}`, { status: newStatus });
      setDonations((prev) =>
        prev.map((donation) =>
          donation._id === id ? { ...donation, status: newStatus } : donation
        )
      );
      toast.success(`Status updated to "${newStatus}"`, {
        position: "top-right",
        autoClose: 3000,
        style: { backgroundColor: "#1E3A8A", color: "#FFFFFF" },
      });
    } catch (err) {
      console.error(err);
      toast.error("Error updating status", {
        position: "top-right",
        autoClose: 3000,
        style: { backgroundColor: "#B91C1C", color: "#FFFFFF" },
      });
    }
  };

  // Admin add/remove donor from donor list
  const handleAddToDonorList = async (id, checked) => {
    try {
      await api.put(`/donations/${id}`, { addToDonorList: checked });
      setDonations((prev) =>
        prev.map((donation) =>
          donation._id === id ? { ...donation, addToDonorList: checked } : donation
        )
      );

      const donorsRes = await api.get("/donors");
      setDonors(donorsRes.data);

      toast.success(
        checked ? "Added to donor list ✅" : "Removed from donor list ❌",
        {
          position: "top-right",
          autoClose: 3000,
          style: { backgroundColor: "#1E3A8A", color: "#FFFFFF" },
        }
      );
    } catch (err) {
      console.error(err);
      toast.error("Error updating donor list", {
        position: "top-right",
        autoClose: 3000,
        style: { backgroundColor: "#B91C1C", color: "#FFFFFF" },
      });
    }
  };

  // Download donor list CSV
  const downloadDonorListCSV = () => {
    if (donors.length === 0) return;

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

  // Download donor list PDF
  const downloadDonorListPDF = () => {
    if (donors.length === 0) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Our Monthly Donors", 14, 20);

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
      headStyles: { fillColor: [30, 58, 138], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save("monthly_donor_list.pdf");
  };

  if (loading) return <p className="text-center mt-10">Loading data...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <ToastContainer />

      {/* Donations Table */}
      <h2 className="text-2xl font-bold mb-6 text-white">All Donations</h2>
      <div className="overflow-x-auto mb-10">
        <table className="min-w-full border border-blue-500 rounded-lg">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="py-2 px-4 border-b border-blue-500">Name</th>
              <th className="py-2 px-4 border-b border-blue-500">Email</th>
              <th className="py-2 px-4 border-b border-blue-500">Type</th>
              <th className="py-2 px-4 border-b border-blue-500">Amount / Item</th>
              <th className="py-2 px-4 border-b border-blue-500">Quantity</th>
              <th className="py-2 px-4 border-b border-blue-500">Acknowledgment</th>
              <th className="py-2 px-4 border-b border-blue-500">Status</th>
              <th className="py-2 px-4 border-b border-blue-500">Add to Donor List</th>
              <th className="py-2 px-4 border-b border-blue-500">Date</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((donation) => (
              <tr key={donation._id} className="hover:bg-white/10 text-white">
                <td className="py-2 px-4 border-b border-blue-500">{donation.donorName}</td>
                <td className="py-2 px-4 border-b border-blue-500">{donation.donorEmail}</td>
                <td className="py-2 px-4 border-b border-blue-500">{donation.donationType}</td>
                <td className="py-2 px-4 border-b border-blue-500">
                  {donation.donationType === "cash" ? `$${donation.amount}` : donation.itemName}
                </td>
                <td className="py-2 px-4 border-b border-blue-500">
                  {donation.donationType === "item" ? donation.quantity : "-"}
                </td>
                <td className="py-2 px-4 border-b border-blue-500">
                  {donation.listAcknowledgment ? "Yes" : "No"}
                </td>
                <td className="py-2 px-4 border-b border-blue-500">
                  <select
                    value={donation.status}
                    onChange={(e) => handleStatusChange(donation._id, e.target.value)}
                    className="border rounded p-1 bg-transparent text-gray-300"
                  >
                    <option value="pending">Pending</option>
                    <option value="received">Received</option>
                  </select>
                </td>
                <td className="py-2 px-4 border-b border-blue-500 text-center">
                  <input
                    type="checkbox"
                    checked={donation.addToDonorList || false}
                    onChange={(e) =>
                      handleAddToDonorList(donation._id, e.target.checked)
                    }
                    className="w-5 h-5 cursor-pointer"
                  />
                </td>
                <td className="py-2 px-4 border-b border-blue-500">
                  {new Date(donation.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Donor List Table */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold mb-4 text-white">Donor List</h2>
        <div className="flex gap-2">
          <button
            onClick={downloadDonorListCSV}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded"
          >
            Download CSV
          </button>
          <button
            onClick={downloadDonorListPDF}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded"
          >
            Download PDF
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg shadow-lg bg-gray-800">
        <table className="min-w-full text-white">
          <thead>
            <tr className="bg-blue-800">
              <th className="py-3 px-6 text-left border-b border-blue-500">#</th>
              <th className="py-3 px-6 text-left border-b border-blue-500">Name</th>
              <th className="py-3 px-6 text-center border-b border-blue-500">Donation Date</th>
            </tr>
          </thead>
          <tbody>
            {donors.map((donor, index) => (
              <tr key={donor._id} className="hover:bg-gray-700/50">
                <td className="py-2 px-6 border-b border-gray-700">{index + 1}</td>
                <td className="py-2 px-6 border-b border-gray-700">{donor.donorName}</td>
                <td className="py-2 px-6 border-b border-gray-700 text-center">
                  {donor.donationDate
                    ? new Date(donor.donationDate).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDonations;
