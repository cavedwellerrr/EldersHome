import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const registerElder = async (data, token) => {
  try {
    const response = await api.post("/elders", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to register elder");
  }
};
