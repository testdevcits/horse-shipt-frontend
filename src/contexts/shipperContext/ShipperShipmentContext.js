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

  /* ===============================
     LIST VIEW API
  =================================*/

  const getAvailableShipments = useCallback(
    async (filters = {}) => {
      if (!token || !isShipper) return;

      setLoading(true);

      try {
        const cleanFilters = Object.fromEntries(
          Object.entries(filters).filter(
            ([_, value]) =>
              value !== "" && value !== null && value !== undefined
          )
        );

        const query = new URLSearchParams(cleanFilters).toString();

        const res = await axios.get(
          `${API_BASE_URL}/shipper/shipments/available?${query}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setShipments(res.data.shipments || []);
      } catch (err) {
        console.error("Get Available Shipments Error:", err);
      } finally {
        setLoading(false);
      }
    },
    [token, isShipper]
  );

  /* ===============================
     MAP VIEW PAGINATION API
  =================================*/

  const getAvailableShipmentsForMap = useCallback(
    async (page = 1, limit = 10) => {
      if (!token || !isShipper) return [];

      try {
        const res = await axios.get(
          `${API_BASE_URL}/shipper/shipments/map?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = res.data.shipments || [];

        setMapShipments((prev) => (page === 1 ? data : [...prev, ...data]));

        return data;
      } catch (err) {
        console.error("Get Shipments For Map Error:", err);
        return [];
      }
    },
    [token, isShipper]
  );

  /* ===============================
     SINGLE SHIPMENT DETAIL
  =================================*/

  const getShipmentById = useCallback(
    async (id) => {
      if (!token || !id) return;

      setLoading(true);

      try {
        const res = await axios.get(`${API_BASE_URL}/shipper/shipments/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  /* ===============================
     AUTO INITIAL LOAD LIST API
  =================================*/

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
