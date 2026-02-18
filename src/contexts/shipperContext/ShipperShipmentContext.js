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
  const [mapShipments, setMapShipments] = useState([]);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchedOnce = useRef(false);

  // Get Available Shipments (List View)
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

      setShipments(res.data.shipments || []);
    } catch (err) {
      console.error("Get Available Shipments Error:", err);
    } finally {
      setLoading(false);
    }
  }, [token, isShipper]);

  //   NEW – Get Shipments For Map (Lightweight API)
  const getAvailableShipmentsForMap = useCallback(async () => {
    if (!token || !isShipper) return [];

    try {
      const res = await axios.get(`${API_BASE_URL}/shipper/shipments/map`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data.shipments || [];
      setMapShipments(data);

      return data;
    } catch (err) {
      console.error("Get Shipments For Map Error:", err);
      return [];
    }
  }, [token, isShipper]);

  //   Get Single Shipment Detail
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

  //  Initial Load (Only List API auto-fetch)
  useEffect(() => {
    if (!token || !isShipper) return;

    if (!fetchedOnce.current) {
      fetchedOnce.current = true;
      getAvailableShipments();
    }
  }, [token, isShipper, getAvailableShipments]);

  return (
    <ShipperShipmentContext.Provider
      value={{
        shipments,
        mapShipments,
        shipment,
        loading,
        getAvailableShipments,
        getAvailableShipmentsForMap,
        getShipmentById,
      }}
    >
      {children}
    </ShipperShipmentContext.Provider>
  );
};

export const useShipperShipment = () => useContext(ShipperShipmentContext);
