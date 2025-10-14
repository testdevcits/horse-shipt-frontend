import axios from "axios";

const BASE_URL = "https://horse-shipt.vercel.app/api/shipper";

export const getShipperDashboard = async (token) => {
  const res = await axios.get(`${BASE_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getShipperOrders = async (token) => {
  const res = await axios.get(`${BASE_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
