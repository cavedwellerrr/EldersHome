import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api";
import { ToastContainer, toast } from "react-toastify";

const DonationSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");
      const donationId = searchParams.get("donation_id");

      console.log("DonationSuccess: Query params:", { sessionId, donationId });

      if (!sessionId || !donationId) {
        setError("Invalid payment details");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/donations/verify-payment?sessionId=${sessionId}&donationId=${donationId}`);
        console.log("Verify payment response:", response.data);
        if (response.data.message === "Payment verified") {
          toast.success("Your donation has been successfully processed!");
        } else {
          setError("Payment verification failed");
        }
      } catch (err) {
        console.error("Verify payment error:", err.response?.data);
        setError(err.response?.data?.message || "Error verifying payment");
        toast.error(err.response?.data?.message || "Error verifying payment");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xl font-semibold text-gray-700">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <ToastContainer />
        <div className="text-center space-y-6 p-8 max-w-lg mx-auto bg-white rounded-2xl shadow-xl border border-orange-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-red-600">Payment Error</h1>
          <p className="text-gray-600">{error}</p>
          <Link
            to="/donations"
            className="btn bg-orange-500 text-white hover:bg-orange-600 border-orange-500 hover:border-orange-600 rounded-lg transition-all duration-200"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
      <ToastContainer />
      <div className="text-center space-y-6 p-8 max-w-lg mx-auto bg-white rounded-2xl shadow-xl border border-orange-100">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Thank You for Your Donation!</h1>
        <p className="text-gray-600">Your contribution has been successfully received. We greatly appreciate your support!</p>
        <Link
          to="/donations"
          className="btn bg-orange-500 text-white hover:bg-orange-600 border-orange-500 hover:border-orange-600 rounded-lg transition-all duration-200"
        >
          Back to Donation Page
        </Link>
      </div>
    </div>
  );
};

export default DonationSuccess;