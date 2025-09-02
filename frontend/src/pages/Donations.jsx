// src/pages/Donations.jsx
import React, { useState } from "react";
import api from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Donations = () => {
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donationType, setDonationType] = useState(""); // start empty to show placeholder
  const [amount, setAmount] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [listAcknowledgment, setListAcknowledgment] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!donationType) {
      toast.error("Please select a donation type", {
        position: "top-right",
        autoClose: 3000,
      });
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

      toast.success("Donation submitted successfully! 🎉", {
        position: "top-right",
        autoClose: 3000,
      });

      // reset form
      setDonorName("");
      setDonorEmail("");
      setDonationType("");
      setAmount("");
      setItemName("");
      setQuantity(1);
      setListAcknowledgment(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error submitting donation", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <ToastContainer />
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
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          title="Please enter a valid email address"
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
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
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
  );
};

export default Donations;
