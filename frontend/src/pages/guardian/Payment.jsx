import React, { useContext } from "react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Payment = ({ requestId }) => {
  const { auth } = useContext(AuthContext);

  const handlePayment = async () => {
    try {
      const res = await axios.post(`/api/payment/checkout/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: res.data.id });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
    >
      Pay Now
    </button>
  );
};

export default Payment;
