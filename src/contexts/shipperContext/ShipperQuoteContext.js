import React, { createContext, useContext, useState, useCallback } from "react";
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
      showToast(
        err.response?.data?.message || err.message || "Failed to fetch quotes",
        "error"
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ---------------- GET ACCEPTED QUOTE BY SHIPMENT ----------------
  const getAcceptedQuoteByShipment = useCallback(
    async (shipmentId) => {
      if (!token || !shipmentId) return null;

      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/shipper/quotes/accepted/${shipmentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAcceptedQuote(res.data.quote || null);
        return res.data.quote || null;
      } catch (err) {
        setAcceptedQuote(null);
        showToast(
          err.response?.data?.message ||
            err.message ||
            "No accepted quote found",
          "error"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

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

      showToast(res.data.message || "Quote cancelled successfully", "success");

      // Update state locally
      setQuotes((prev) =>
        prev.map((q) => (q._id === quoteId ? { ...q, status: "cancelled" } : q))
      );

      if (acceptedQuote?._id === quoteId) setAcceptedQuote(null);

      return { success: true, cancellationFee: res.data.cancellationFee };
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to cancel quote",
        "error"
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

      showToast(res.data.message || "Quote deleted successfully", "success");

      // Remove from state
      setQuotes((prev) => prev.filter((q) => q._id !== quoteId));

      return { success: true };
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to delete quote",
        "error"
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

      showToast(res.data.message || "Vehicle assigned successfully", "success");

      setQuotes((prev) =>
        prev.map((q) =>
          q._id === quoteId
            ? {
                ...q,
                vehicle: vehicleId,
                transportType: res.data.quote.transportType,
                stallsRequired: res.data.quote.stallsRequired,
              }
            : q
        )
      );

      // If accepted quote same hai
      if (acceptedQuote?._id === quoteId) {
        setAcceptedQuote(res.data.quote);
      }

      return { success: true, data: res.data.quote };
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          err.message ||
          "Failed to assign vehicle",
        "error"
      );
      return { success: false };
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
        assignVehicleToQuote,
        getMyQuotes,
        getAcceptedQuoteByShipment,
        cancelQuote,
        deleteQuote,
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
