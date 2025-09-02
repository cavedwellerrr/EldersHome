// services/paymentService.js

// Mock service to simulate a payment session
export const createCheckoutSession = async ({
  amount,
  currency = "usd",
  successUrl,
  cancelUrl,
}) => {
  // Generate a mock session object
  const session = {
    id: `mock_session_${Date.now()}`,
    amount,
    currency,
    status: "mocked_success",
    url: successUrl || "/payment-success", // Redirect URL in your frontend
    cancelUrl: cancelUrl || "/payment-cancel",
  };

  // Simulate async behavior like a real API call
  return new Promise((resolve) => {
    setTimeout(() => resolve(session), 100); // small delay
  });
};
