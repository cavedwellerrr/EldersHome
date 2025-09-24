// PaymentPage.jsx
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function PaymentPage() {
  const { id } = useParams(); // 🔹 id comes from route param

  useEffect(() => {
    const initPayment = async () => {
      if (!id) {
        console.error("No elder ID in URL");
        return;
      }

      try {
        const res = await fetch(`/api/payments/create-session/${id}`, {
          method: "POST",
        });

        console.log("Response status:", res.status);

        const data = await res.json(); // 🔹 parse JSON
        console.log("Response data:", data);

        if (data.url) {
          window.location.href = data.url; // redirect to Stripe
        } else {
          alert("Failed to initialize payment");
        }
      } catch (error) {
        alert("Error: " + error.message);
      }
    };

    initPayment();
  }, [id]);

  return <p>Redirecting to Stripe Checkout...</p>;
}
