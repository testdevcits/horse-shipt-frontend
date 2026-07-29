import axios from "axios";
import { SHIPPER_API_BASE_URL as BASE_URL } from "../config/api";

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
