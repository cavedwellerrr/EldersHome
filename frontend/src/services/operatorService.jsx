// frontend/src/services/operatorService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api"; // change if needed

export const getPendingRequests = async () => {
  const res = await axios.get(`${API_URL}/elderRequests/pending`);
  return res.data;
};

export const approveRequest = async (id) => {
  await axios.put(`${API_URL}/elderRequests/approve/${id}`);
};

export const rejectRequest = async (id) => {
  await axios.put(`${API_URL}/elderRequests/reject/${id}`);
};
