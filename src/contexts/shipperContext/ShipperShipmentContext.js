import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

const ShipperShipmentContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api";

export const ShipperShipmentProvider = ({ children }) => {
  const { token } = useAuth();

  const [shipments, setShipments] = useState([]);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---------------- GET AVAILABLE SHIPMENTS ----------------
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
      console.error("Get Available Shipments Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- GET SHIPMENT BY ID ----------------
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
      console.error("Get Shipment By ID Error:", err);
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- AUTO FETCH AVAILABLE SHIPMENTS ON LOGIN ----------------
  useEffect(() => {
    if (token && shipments.length === 0) {
      getAvailableShipments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // ignore getAvailableShipments dependency to prevent loop

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
