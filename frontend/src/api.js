import axios from "axios";

const api = axios.create({
  baseURL: "htttp://localhost:5000/api",
  withCredentials: true,
});

export default api;
