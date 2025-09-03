import React, { useState, useEffect } from "react";
import api from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Donations = () => {
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donationType, setDonationType] = useState("");
  const [amount, setAmount] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [listAcknowledgment, setListAcknowledgment] = useState(false);
  const [donors, setDonors] = useState([]);

  // Fetch donor list on load
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const res = await api.get("/donors");
        setDonors(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Error fetching donor list");
      }
    };

    fetchDonors(); // initial fetch

    const interval = setInterval(fetchDonors, 5000); // every 5 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!donationType) {
      toast.error("Please select a donation type");
      return;
    }

    try {
      await api.post("/donations", {
        donorName,
        donorEmail,
        donationType,
        amount: donationType === "cash" ? Number(amount) : undefined,
        itemName: donationType === "item" ? itemName : undefined,
        quantity: donationType === "item" ? Number(quantity) : undefined,
        listAcknowledgment,
      });

      toast.success("Donation submitted successfully!");

      // Reset form
      setDonorName("");
      setDonorEmail("");
      setDonationType("");
      setAmount("");
      setItemName("");
      setQuantity(1);
      setListAcknowledgment(false);

      // Refetch donor list in case new donor was added
      const res = await api.get("/donors");
      setDonors(res.data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error submitting donation");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 flex gap-10">
      <ToastContainer />

      {/* Left: Donation Form */}
      <div className="flex-1 border p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Make a Donation</h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <select
            value={donationType}
            onChange={(e) => setDonationType(e.target.value)}
            className="p-2 border rounded"
            required
          >
            <option value="" disabled hidden>
              Type
            </option>
            <option value="cash">Cash</option>
            <option value="item">Item</option>
          </select>
          {donationType === "cash" && (
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-6 p-2 border rounded w-full"
                required
              />
            </div>
          )}
          {donationType === "item" && (
            <>
              <input
                type="text"
                placeholder="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="p-2 border rounded"
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="p-2 border rounded"
                min={1}
                required
              />
            </>
          )}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={listAcknowledgment}
              onChange={(e) => setListAcknowledgment(e.target.checked)}
            />
            <span>Allow my name to be listed publicly</span>
          </label>
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-500"
          >
            Submit Donation
          </button>
        </form>
      </div>

      {/* Right: Donor List */}
      <div className="w-1/3 border p-6 rounded shadow bg-transparent">
        <h2 className="text-2xl text-white font-bold mb-4">Our Monthly Donors</h2>
        <ul className="space-y-2">
          {donors.length === 0 ? (
            <li>No donors yet.</li>
          ) : (
            donors.map((donor) => (
              <li key={donor._id} className=" py-1">
                {donor.donorName}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Donations;
