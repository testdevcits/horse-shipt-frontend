import axios from "axios";

const API_BASE_URL = "https://horse-shipt.vercel.app/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const loginUser = async (data) => {
  return await api.post("/auth/login", data);
};

export const signupUser = async (data) => {
  return await api.post("/auth/signup", data);
};

export default api;
