import React, { useEffect, useState } from "react";
import api from "../../api";
import { ToastContainer, toast } from "react-toastify";

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await api.get("/donations");
        setDonations(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Error fetching donations");
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

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
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: "#1E3A8A",
          color: "#FFFFFF",
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Error updating status", {
        position: "top-right",
        autoClose: 3000,
        style: {
          backgroundColor: "#B91C1C",
          color: "#FFFFFF",
        },
      });
    }
  };

  if (loading) return <p className="text-center mt-10">Loading donations...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-6 text-white">All Donations</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-blue-500 rounded-lg">
          <thead>
            <tr className="bg-blue-800 text-white">
              <th className="py-2 px-4 border-b border-blue-500">Name</th>
              <th className="py-2 px-4 border-b border-blue-500">Email</th>
              <th className="py-2 px-4 border-b border-blue-500">Type</th>
              <th className="py-2 px-4 border-b border-blue-500">Amount / Item</th>
              <th className="py-2 px-4 border-b border-blue-500">Quantity</th>
              <th className="py-2 px-4 border-b border-blue-500">Acknowledgment</th>
              <th className="py-2 px-4 border-b border-blue-500">Status</th>
              <th className="py-2 px-4 border-b border-blue-500">Date</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((donation) => (
              <tr key={donation._id} className="hover:bg-blue-100/10 text-white">
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
                    className="border rounded p-1 bg-transparent text-white"
                  >
                    <option value="pending" className="bg-blue-600 text-white">Pending</option>
                    <option value="received" className="bg-blue-600 text-white">Received</option>
                  </select>
                </td>
                <td className="py-2 px-4 border-b border-blue-500">
                  {new Date(donation.createdAt).toLocaleDateString()}
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
