import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { API_BASE_URL } from "../../config/api";

const ShipperShipmentContext = createContext();

export const ShipperShipmentProvider = ({ children }) => {
  const { token, isShipper } = useAuth();

  const [shipments, setShipments] = useState([]);
  const [mapShipments, setMapShipments] = useState([]);

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availablePagination, setAvailablePagination] = useState(null);
  const [availableLoaded, setAvailableLoaded] = useState(false);
  const availableRequestRef = useRef(0);

  /* ===============================
     LIST VIEW API
  =================================*/

  const getAvailableShipments = useCallback(
    async (filters = {}, pagination = null) => {
      if (!token || !isShipper) return;

      const requestId = ++availableRequestRef.current;
      setLoading(true);

      try {
        const cleanFilters = Object.fromEntries(
          Object.entries(filters).filter(
            ([_, value]) =>
              value !== "" && value !== null && value !== undefined
          )
        );

        if (pagination) {
          cleanFilters.page = pagination.page || 1;
          cleanFilters.limit = pagination.limit || 10;
        }

        const query = new URLSearchParams(cleanFilters).toString();

        const res = await axios.get(
          `${API_BASE_URL}/shipper/shipments/available?${query}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (requestId === availableRequestRef.current) {
          setShipments(res.data.shipments || []);
          setAvailablePagination(res.data.pagination || null);
          setAvailableLoaded(true);
        }
      } catch (err) {
        console.error("Get Available Shipments Error:", err);
        if (requestId === availableRequestRef.current) setAvailableLoaded(true);
      } finally {
        if (requestId === availableRequestRef.current) setLoading(false);
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

  return (
    <ShipperShipmentContext.Provider
      value={{
        shipments,
        availablePagination,
        availableLoaded,
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
