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
      console.error(err);
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

      const donorsRes = await api.get("/donors");
      setDonors(donorsRes.data);

      toast.success(
        checked ? "Added to donor list ✅" : "Removed from donor list ❌"
      );
    } catch (err) {
      console.error(err);
      toast.error("Error updating donor list");
    }
  };

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
      headStyles: { fillColor: [34, 197, 94], textColor: 255 }, // emerald/forest green
      alternateRowStyles: { fillColor: [229, 231, 235] },
    });

    doc.save("monthly_donor_list.pdf");
  };

  if (loading) return <p className="text-center mt-10">Loading data...</p>;
  if (error) return <p className="text-center mt-10 text-error">{error}</p>;

  return (
    <div className="min-h-screen bg-base-100 p-6">
      <ToastContainer />

      {/* Donations Table */}
      <h2 className="text-2xl font-bold mb-6">All Donations</h2>
      <div className="overflow-x-auto mb-10 card bg-base-100 shadow">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Type</th>
              <th>Amount / Item</th>
              <th>Quantity</th>
              <th>Acknowledgment</th>
              <th>Status</th>
              <th>Add to Donor List</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((donation) => (
              <tr key={donation._id}>
                <td>{donation.donorName}</td>
                <td>{donation.donorEmail}</td>
                <td>{donation.donationType}</td>
                <td>
                  {donation.donationType === "cash"
                    ? `$${donation.amount}`
                    : donation.itemName}
                </td>
                <td>
                  {donation.donationType === "item" ? donation.quantity : "-"}
                </td>
                <td>{donation.listAcknowledgment ? "Yes" : "No"}</td>
                <td>
                  <select
                    value={donation.status}
                    onChange={(e) =>
                      handleStatusChange(donation._id, e.target.value)
                    }
                    className="select select-bordered select-sm w-full"
                  >
                    <option value="pending">Pending</option>
                    <option value="received">Received</option>
                  </select>
                </td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={donation.addToDonorList || false}
                    onChange={(e) =>
                      handleAddToDonorList(donation._id, e.target.checked)
                    }
                    className="checkbox checkbox-success"
                  />
                </td>
                <td>{new Date(donation.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Donor List Table */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Donor List</h2>
        <div className="flex gap-2">
          <button onClick={downloadDonorListCSV} className="btn btn-success">
            Download CSV
          </button>
          <button onClick={downloadDonorListPDF} className="btn btn-error">
            Download PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto card bg-base-100 shadow">
        <table className="table w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th className="text-center">Donation Date</th>
            </tr>
          </thead>
          <tbody>
            {donors.map((donor, index) => (
              <tr key={donor._id}>
                <td>{index + 1}</td>
                <td>{donor.donorName}</td>
                <td className="text-center">
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
