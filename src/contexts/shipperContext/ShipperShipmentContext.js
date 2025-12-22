import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import Toast from "../../components/common/Toast";

const ShipperShipmentContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api/shipper";

export const ShipperShipmentProvider = ({ children }) => {
  const { token, user } = useAuth();

  const [availableShipments, setAvailableShipments] = useState([]);
  const [assignedShipments, setAssignedShipments] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------------- TOAST ----------------
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const showToast = (message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  };

  // ---------------- GET AVAILABLE SHIPMENTS ----------------
  const getAvailableShipments = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/shipments/available`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        // Set shipments; you could also sort by pickupDate if needed
        setAvailableShipments(res.data.shipments || []);
      } else {
        showToast(
          res.data.message || "Failed to fetch available shipments",
          "error"
        );
      }
    } catch (err) {
      console.error(err);
      // Show backend message if exists
      showToast(
        err.response?.data?.message || "Failed to fetch available shipments",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ---------------- GET ASSIGNED SHIPMENTS ----------------
  const getAssignedShipments = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/shipments/assigned`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAssignedShipments(res.data.shipments || []);
    } catch (err) {
      showToast("Failed to fetch assigned shipments", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ---------------- AUTO LOAD ----------------
  useEffect(() => {
    if (token && user?.role === "shipper") {
      getAvailableShipments();
      getAssignedShipments();
    }
  }, [token, user, getAvailableShipments, getAssignedShipments]);

  return (
    <ShipperShipmentContext.Provider
      value={{
        availableShipments,
        assignedShipments,
        loading,
        getAvailableShipments,
        getAssignedShipments,
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
    </ShipperShipmentContext.Provider>
  );
};

export const useShipperShipment = () => useContext(ShipperShipmentContext);
