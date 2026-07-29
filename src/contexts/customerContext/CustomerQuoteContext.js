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
import { API_BASE_URL } from "../../config/api";

const CustomerQuoteContext = createContext();

export const CustomerQuoteProvider = ({ children }) => {
  const { token, user, isCustomer } = useAuth();

  // ---------------- STATE ----------------
  const [quotes, setQuotes] = useState([]);
  const [totalQuotes, setTotalQuotes] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeShipmentId, setActiveShipmentId] = useState(null);

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

      setActiveShipmentId(shipmentId);
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
  const acceptQuote = async (
    quoteId,
    customerSignature,
    options = { showSuccessToast: true }
  ) => {
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

      if (options.showSuccessToast !== false) {
        showToast(res.data.message || "Quote accepted successfully", "success");
      }

      // Update local state
      setQuotes((prevQuotes) =>
        prevQuotes.map((q) =>
          q._id === quoteId
            ? { ...q, status: "accepted", contractAccepted: true }
            : { ...q, status: "rejected" }
        )
      );

      return { success: true, message: res.data.message };
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

  /* =========================================================
     REJECT QUOTE
  ========================================================= */
  const rejectQuote = async (quoteId, reason = "") => {
    if (!token || !quoteId) return { success: false };

    setLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/customer/quotes/${quoteId}/reject`,
        { reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setQuotes((prev) => prev.filter((item) => item._id !== quoteId));
      setTotalQuotes((prev) => Math.max(0, prev - 1));
      showToast(res.data.message || "Quote rejected", "success");
      return { success: true, quoteId, deleted: true };
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to reject quote",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !isCustomer || !user?._id) return;

    const normalizeId = (value) =>
      typeof value === "object" && value?._id ? value._id : value;

    const handleQuoteCreated = ({ quote, shipmentId }) => {
      if (!quote?._id) return;

      if (!activeShipmentId) return;
      if (normalizeId(shipmentId)?.toString() !== activeShipmentId.toString()) {
        return;
      }

      setQuotes((prev) => {
        if (prev.some((item) => item._id === quote._id)) return prev;
        return [quote, ...prev];
      });
      setTotalQuotes((prev) => prev + 1);
    };

    const updateQuote = ({ quote, quoteId, shipmentId, deleted }) => {
      const targetQuoteId = quote?._id || quoteId;
      if (!targetQuoteId) return;
      if (
        activeShipmentId &&
        normalizeId(shipmentId)?.toString() !== activeShipmentId.toString()
      ) {
        return;
      }

      setQuotes((prev) => {
        if (deleted || quote?.isDeleted || quote?.status === "rejected") {
          return prev.filter((item) => item._id !== targetQuoteId);
        }

        return prev.map((item) =>
          item._id === targetQuoteId ? { ...item, ...quote } : item
        );
      });
    };

    socket.on("horse_shipt:quote_created", handleQuoteCreated);
    socket.on("horse_shipt:quote_accepted", updateQuote);
    socket.on("horse_shipt:quote_rejected", updateQuote);
    socket.on("horse_shipt:quote_cancelled", updateQuote);
    socket.on("horse_shipt:quote_vehicle_assigned", updateQuote);

    return () => {
      socket.off("horse_shipt:quote_created", handleQuoteCreated);
      socket.off("horse_shipt:quote_accepted", updateQuote);
      socket.off("horse_shipt:quote_rejected", updateQuote);
      socket.off("horse_shipt:quote_cancelled", updateQuote);
      socket.off("horse_shipt:quote_vehicle_assigned", updateQuote);
    };
  }, [token, isCustomer, user?._id, activeShipmentId]);

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
        rejectQuote,
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
