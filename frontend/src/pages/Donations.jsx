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

    fetchDonors();
    const interval = setInterval(fetchDonors, 5000);
    return () => clearInterval(interval);
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

      // Refetch donor list
      const res = await api.get("/donors");
      setDonors(res.data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error submitting donation");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <ToastContainer />

      <div className="max-w-6xl mx-auto flex gap-10">
        {/* Left Section */}
        <div className="flex-1">
          <div className="mb-6 card bg-base-100 shadow p-4">
            <h2 className="text-2xl font-bold mb-2 text-primary">
              Every Contribution Counts 💛
            </h2>
            <p>
              Your donations directly support our mission and help us continue
              to make a positive impact. Whether big or small, each contribution
              goes a long way in changing lives. Thank you for being part of
              this journey.
            </p>
          </div>

          <p className="mb-4 text-lg font-medium">
            You can fill this form to make a donation for us. It will be greatly
            appreciated!
          </p>

          <div className="card p-6 shadow bg-base-100">
            <h2 className="text-xl font-bold mb-4">Make a Donation</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Your Name"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="input input-bordered w-full"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                className="input input-bordered w-full"
                required
              />
              <select
                value={donationType}
                onChange={(e) => setDonationType(e.target.value)}
                className="select select-bordered w-full"
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
                    className="input input-bordered w-full pl-6"
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
                    className="input input-bordered w-full"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="input input-bordered w-full"
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
                  className="checkbox"
                />
                <span>Allow my name to be listed publicly</span>
              </label>

              <button type="submit" className="btn btn-primary">
                Submit Donation
              </button>
            </form>
          </div>
        </div>

        {/* Right Section: Donor List */}
        <div className="w-1/3 card shadow p-6 bg-base-100 sticky top-10 h-fit">
          <h2 className="text-2xl font-bold mb-4">Our Monthly Donors</h2>
          <ul className="space-y-2">
            {donors.length === 0 ? (
              <li>No donors yet.</li>
            ) : (
              donors.map((donor) => (
                <li key={donor._id} className="py-1">
                  {donor.donorName}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Donations;
