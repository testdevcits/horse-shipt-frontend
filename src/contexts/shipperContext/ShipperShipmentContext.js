import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

const ShipperShipmentContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api";

export const ShipperShipmentProvider = ({ children }) => {
  const { token, isShipper } = useAuth();

  const [shipments, setShipments] = useState([]);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Ref to track if we already fetched once
  const fetchedOnce = useRef(false);

  // ---------------- GET AVAILABLE SHIPMENTS ----------------
  const getAvailableShipments = useCallback(async () => {
    if (!token || !isShipper) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/shipper/shipments/available`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Set shipments even if empty
      setShipments(res.data.shipments || []);
    } catch (err) {
      console.error("Get Available Shipments Error:", err);
    } finally {
      setLoading(false);
      // Mark as fetched to prevent continuous calls
      fetchedOnce.current = true;
    }
  }, [token, isShipper]);

  // ---------------- GET SHIPMENT BY ID ----------------
  const getShipmentById = useCallback(
    async (id) => {
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
    },
    [token]
  );

  // ---------------- AUTO FETCH ON LOGIN (ONE TIME) ----------------
  useEffect(() => {
    if (token && isShipper && !fetchedOnce.current) {
      getAvailableShipments();
    }
  }, [token, isShipper, getAvailableShipments]);

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
