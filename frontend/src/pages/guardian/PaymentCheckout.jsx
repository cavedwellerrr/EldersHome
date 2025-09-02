import React from "react";
import { createPaymentSession } from "../../services/paymentService";

const PaymentCheckout = ({ requestId }) => {
  const handleCheckout = async () => {
    try {
      const session = await createPaymentSession(requestId);
      window.location.href = session.url; // redirect to Stripe checkout
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="text-xl mb-4">Make Payment</h2>
      <button
        onClick={handleCheckout}
        className="bg-blue-600 text-white p-2 rounded"
      >
        Pay Now
      </button>
    </div>
  );
};

export default PaymentCheckout;
