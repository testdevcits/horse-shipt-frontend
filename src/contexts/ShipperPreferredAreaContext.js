import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import Toast from "../components/common/Toast";

const ShipperPreferredAreaContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api/shipper";

export const ShipperPreferredAreaProvider = ({ children }) => {
  const { token, user } = useAuth();

  const [preferredAreas, setPreferredAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "", visible: false });

  // ---------------- TOAST HANDLER ----------------
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  }, []);

  // ---------------- FETCH PREFERRED AREAS ----------------
  const fetchPreferredAreas = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/preferred-areas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPreferredAreas(res.data.data || []);
    } catch (err) {
      console.error(
        "Fetch Preferred Areas Error:",
        err.response?.data || err.message
      );
      showToast("Failed to load preferred areas", "error");
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  // ---------------- AUTO FETCH WHEN TOKEN AVAILABLE ----------------
  useEffect(() => {
    if (token && user?.role === "shipper") {
      fetchPreferredAreas();
    } else {
      setPreferredAreas([]);
    }
  }, [token, user, fetchPreferredAreas]);

  // ---------------- ADD PREFERRED AREA ----------------
  const addPreferredArea = async (areaData) => {
    if (!token) return { success: false };
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/preferred-areas`,
        areaData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPreferredAreas((prev) => [res.data.data, ...prev]);
      showToast("Preferred area added successfully", "success");
      return { success: true };
    } catch (err) {
      console.error(
        "Add Preferred Area Error:",
        err.response?.data || err.message
      );
      showToast(
        err.response?.data?.message || "Failed to add preferred area",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UPDATE PREFERRED AREA ----------------
  const updatePreferredArea = async (areaId, updatedData) => {
    if (!token) return { success: false };
    setLoading(true);

    try {
      const res = await axios.put(
        `${API_BASE_URL}/preferred-areas/${areaId}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPreferredAreas((prev) =>
        prev.map((a) => (a._id === areaId ? res.data.data : a))
      );
      showToast("Preferred area updated successfully", "success");
      return { success: true };
    } catch (err) {
      console.error(
        "Update Preferred Area Error:",
        err.response?.data || err.message
      );
      showToast(
        err.response?.data?.message || "Failed to update preferred area",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- DELETE PREFERRED AREA ----------------
  const deletePreferredArea = async (areaId) => {
    if (!token) return { success: false };
    setLoading(true);

    try {
      await axios.delete(`${API_BASE_URL}/preferred-areas/${areaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPreferredAreas((prev) => prev.filter((a) => a._id !== areaId));
      showToast("Preferred area deleted successfully", "success");
      return { success: true };
    } catch (err) {
      console.error(
        "Delete Preferred Area Error:",
        err.response?.data || err.message
      );
      showToast(
        err.response?.data?.message || "Failed to delete preferred area",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShipperPreferredAreaContext.Provider
      value={{
        preferredAreas,
        loading,
        fetchPreferredAreas,
        addPreferredArea,
        updatePreferredArea,
        deletePreferredArea,
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
    </ShipperPreferredAreaContext.Provider>
  );
};

export const useShipperPreferredAreas = () =>
  useContext(ShipperPreferredAreaContext);
