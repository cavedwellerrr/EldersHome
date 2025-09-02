import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/payment",
  withCredentials: true,
});

export const createPaymentSession = async (requestId) => {
  const res = await API.post(`/checkout/${requestId}`);
  return res.data;
};
