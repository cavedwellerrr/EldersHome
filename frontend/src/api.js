import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", //  backend port
  withCredentials: true, // needed for cookies
});



export default api;
