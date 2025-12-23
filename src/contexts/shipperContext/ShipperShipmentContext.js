import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

const ShipperShipmentContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api";

export const ShipperShipmentProvider = ({ children }) => {
  const { token } = useAuth();

  const [shipments, setShipments] = useState([]);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 GET AVAILABLE SHIPMENTS
  const getAvailableShipments = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/shipper/shipments/available`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShipments(res.data.shipments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 GET SHIPMENT BY ID
  const getShipmentById = async (id) => {
    if (!token || !id) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/shipper/shipments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShipment(res.data.shipment);
      return res.data.shipment;
    } catch (err) {
      console.error(err);
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShipperShipmentContext.Provider
      value={{
        shipments,
        shipment,
        loading,
        getAvailableShipments,
        getShipmentById,
      }}
    >
      {children}
    </ShipperShipmentContext.Provider>
  );
};

export const useShipperShipment = () => useContext(ShipperShipmentContext);
