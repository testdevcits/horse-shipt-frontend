import axios from "axios";

const BASE_URL = "https://horse-shipt.vercel.app/api/customer";

export const getCustomerDashboard = async (token) => {
  const res = await axios.get(`${BASE_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getCustomerOrders = async (token) => {
  const res = await axios.get(`${BASE_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
