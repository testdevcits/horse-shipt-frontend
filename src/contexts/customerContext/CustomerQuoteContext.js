import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import Toast from "../../components/common/Toast";

const CustomerQuoteContext = createContext();

const API_BASE_URL = "https://horse-shipt.vercel.app/api";

export const CustomerQuoteProvider = ({ children }) => {
  const { token } = useAuth();

  // ---------------- STATE ----------------
  const [quotes, setQuotes] = useState([]);
  const [totalQuotes, setTotalQuotes] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);

  // ---------------- TOAST ----------------
  const [toast, setToast] = useState({
    message: "",
    type: "",
    visible: false,
  });

  const showToast = (message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  };

  /* =========================================================
     GET QUOTES BY SHIPMENT ID (WITH PAGINATION)
  ========================================================= */
  const getQuotesByShipment = useCallback(
    async (shipmentId, force = false, page = 1, limit = 5) => {
      if (!token || !shipmentId) return;

      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/customer/quotes/${shipmentId}?page=${page}&limit=${limit}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          setQuotes(res.data.quotes || []);
          setTotalQuotes(res.data.totalQuotes || 0);
          setCurrentPage(res.data.currentPage || page);
          setTotalPages(res.data.totalPages || 1);
        } else {
          setQuotes([]);
          setTotalQuotes(0);
          showToast(res.data.message || "No quotes found", "info");
        }
      } catch (error) {
        console.error(error);
        setQuotes([]);
        setTotalQuotes(0);
        showToast(
          error.response?.data?.message || "Failed to fetch quotes",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  /* =========================================================
     ACCEPT QUOTE
  ========================================================= */
  const acceptQuote = async (quoteId, customerSignature) => {
    if (!token) {
      showToast("Unauthorized. Please login again.", "error");
      return { success: false };
    }

    if (!customerSignature) {
      showToast("Customer signature is required", "error");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/customer/quotes/${quoteId}/accept`,
        { customerSignature },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      showToast(res.data.message || "Quote accepted successfully", "success");

      // Update local state
      setQuotes((prevQuotes) =>
        prevQuotes.map((q) =>
          q._id === quoteId
            ? { ...q, status: "accepted", contractAccepted: true }
            : { ...q, status: "rejected" }
        )
      );

      return { success: true };
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to accept quote",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     CANCEL QUOTE
  ========================================================= */
  const cancelQuote = async (quoteId, reason) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/customer/quotes/${quoteId}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, message: "Cancel failed" };
    }
  };

  return (
    <CustomerQuoteContext.Provider
      value={{
        quotes,
        totalQuotes,
        currentPage,
        totalPages,
        loading,
        getQuotesByShipment,
        acceptQuote,
        cancelQuote,
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
    </CustomerQuoteContext.Provider>
  );
};

// ---------------- HOOK ----------------
export const useCustomerQuote = () => useContext(CustomerQuoteContext);
