import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import Toast from "../../components/common/Toast";

const ShipperQuoteContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api";

export const ShipperQuoteProvider = ({ children }) => {
  const { token } = useAuth();

  const [quotes, setQuotes] = useState([]);
  const [acceptedQuote, setAcceptedQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({ message: "", type: "", visible: false });

  const showToast = (message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  };

  // ---------------- ADD QUOTE ----------------
  const addQuote = async (data) => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/shipper/quotes/add`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showToast("Quote sent successfully", "success");
      return { success: true, data: res.data.quote };
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to send quote",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- GET MY QUOTES ----------------
  const getMyQuotes = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/shipper/quotes/mq`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuotes(res.data.quotes || []);
      return res.data.quotes || [];
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to fetch quotes",
        "error"
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  // ---------------- GET ACCEPTED QUOTE BY SHIPMENT ----------------
  const getAcceptedQuoteByShipment = async (shipmentId) => {
    if (!token || !shipmentId) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/shipper/quotes/accepted/${shipmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAcceptedQuote(res.data.quote || null);
      return res.data.quote || null;
    } catch (err) {
      setAcceptedQuote(null);
      showToast(
        err.response?.data?.message || err.message || "No accepted quote found",
        "error"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShipperQuoteContext.Provider
      value={{
        quotes,
        acceptedQuote,
        loading,
        addQuote,
        getMyQuotes,
        getAcceptedQuoteByShipment,
      }}
    >
      {children}

      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "", visible: false })}
        />
      )}
    </ShipperQuoteContext.Provider>
  );
};

export const useShipperQuote = () => useContext(ShipperQuoteContext);
