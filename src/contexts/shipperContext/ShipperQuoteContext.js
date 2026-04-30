import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import Toast from "../../components/common/Toast";
import { socket } from "../../services/socket";

const ShipperQuoteContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api";

export const ShipperQuoteProvider = ({ children }) => {
  const { token, user, isShipper } = useAuth();

  const [quotes, setQuotes] = useState([]);
  const [acceptedQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---------------- ADD QUOTE ----------------
  const addQuote = async (data) => {
    if (!token) {
      Toast.error("Your session has expired. Please log in again.");
      return { success: false, message: "Missing auth token" };
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/shipper/quotes/add`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Toast.success("Quote sent successfully");
      return { success: true, data: res.data.quote };
    } catch (err) {
      Toast.error(
        err.response?.data?.message || err.message || "Failed to send quote"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- GET MY QUOTES ----------------
  const getMyQuotes = useCallback(async () => {
    if (!token) return [];

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/shipper/quotes/mq`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuotes(res.data.quotes || []);
      return res.data.quotes || [];
    } catch (err) {
      Toast.error(
        err.response?.data?.message || err.message || "Failed to fetch quotes"
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ---------------- CANCEL QUOTE ----------------
  const cancelQuote = async (quoteId) => {
    if (!token || !quoteId) return;

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/shipper/quotes/cancel`,
        { quoteId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Toast.success(res.data.message || "Quote cancelled successfully");

      setQuotes((prev) =>
        prev.map((q) => (q._id === quoteId ? { ...q, status: "cancelled" } : q))
      );

      return { success: true };
    } catch (err) {
      Toast.error(
        err.response?.data?.message || err.message || "Failed to cancel quote"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- DELETE QUOTE ----------------
  const deleteQuote = async (quoteId) => {
    if (!token || !quoteId) return;

    setLoading(true);
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/shipper/delete/${quoteId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Toast.success(res.data.message || "Quote deleted successfully");

      setQuotes((prev) => prev.filter((q) => q._id !== quoteId));

      return { success: true };
    } catch (err) {
      Toast.error(
        err.response?.data?.message || err.message || "Failed to delete quote"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- ASSIGN VEHICLE ----------------
  const assignVehicleToQuote = async (quoteId, vehicleId) => {
    if (!token || !quoteId || !vehicleId) return;

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/shipper/assign-vehicle`,
        { quoteId, vehicleId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Toast.success(res.data.message || "Vehicle assigned successfully");

      setQuotes((prev) =>
        prev.map((q) =>
          q._id === quoteId ? { ...q, vehicle: res.data.quote.vehicle } : q
        )
      );

      return { success: true };
    } catch (err) {
      Toast.error(
        err.response?.data?.message || err.message || "Failed to assign vehicle"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !isShipper || !user?._id) return;

    const upsertQuote = ({ quote }) => {
      if (!quote?._id) return;

      setQuotes((prev) => {
        const exists = prev.some((item) => item._id === quote._id);
        if (exists) {
          return prev.map((item) => (item._id === quote._id ? quote : item));
        }
        return [quote, ...prev];
      });
    };

    const markQuoteCancelled = ({ quote }) => {
      if (!quote?._id) return;

      setQuotes((prev) =>
        prev.map((item) =>
          item._id === quote._id
            ? { ...item, ...quote, status: quote.status || "cancelled" }
            : item
        )
      );
    };

    socket.on("horse_shipt:quote_accepted", upsertQuote);
    socket.on("horse_shipt:quote_cancelled", markQuoteCancelled);
    socket.on("horse_shipt:quote_vehicle_assigned", upsertQuote);

    return () => {
      socket.off("horse_shipt:quote_accepted", upsertQuote);
      socket.off("horse_shipt:quote_cancelled", markQuoteCancelled);
      socket.off("horse_shipt:quote_vehicle_assigned", upsertQuote);
    };
  }, [token, isShipper, user?._id]);

  return (
    <ShipperQuoteContext.Provider
      value={{
        quotes,
        acceptedQuote,
        loading,
        addQuote,
        assignVehicleToQuote,
        getMyQuotes,
        cancelQuote,
        deleteQuote,
      }}
    >
      {children}
    </ShipperQuoteContext.Provider>
  );
};

export const useShipperQuote = () => useContext(ShipperQuoteContext);
