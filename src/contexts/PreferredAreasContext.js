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

const PreferredAreasContext = createContext();

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://horse-shipt.vercel.app/api/shipper";

export const PreferredAreasProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [preferredAreas, setPreferredAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  // ---------------- TOAST STATE ----------------
  const [toast, setToast] = useState({
    message: "",
    type: "",
    visible: false,
  });

  const showToast = (message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast({ message: "", type: "", visible: false });
    }, 3000);
  };

  // ---------------- FETCH PREFERRED AREAS ----------------
  const fetchPreferredAreas = useCallback(async () => {
    // Only fetch for logged-in shipper users
    if (!token || !user || user.role !== "shipper" || fetched) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/preferred-areas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPreferredAreas(res.data.preferredAreas || []);
      setFetched(true);
    } catch (err) {
      console.error(
        "Fetch Preferred Areas Error:",
        err.response?.data || err.message
      );
      showToast(
        err.response?.data?.message || "Failed to fetch preferred areas",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------------- ADD PREFERRED AREA ----------------
  const addPreferredArea = async (formData) => {
    if (!token || user?.role !== "shipper") {
      showToast("Unauthorized. Please log in as a shipper.", "error");
      return { success: false };
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/preferred-areas`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      await fetchPreferredAreas();
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
  const updatePreferredArea = async (id, formData) => {
    if (!token || user?.role !== "shipper") {
      showToast("Unauthorized. Please log in as a shipper.", "error");
      return { success: false };
    }
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/preferred-areas/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      await fetchPreferredAreas();
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
  const deletePreferredArea = async (id) => {
    if (!token || user?.role !== "shipper") {
      showToast("Unauthorized. Please log in as a shipper.", "error");
      return { success: false };
    }
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/preferred-areas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchPreferredAreas();
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

  // ---------------- INITIAL FETCH ----------------
  useEffect(() => {
    if (user && user.role === "shipper") {
      fetchPreferredAreas();
    } else {
      setPreferredAreas([]);
      setFetched(false);
    }
  }, [user, fetchPreferredAreas]);

  return (
    <PreferredAreasContext.Provider
      value={{
        preferredAreas,
        loading,
        fetched,
        fetchPreferredAreas,
        addPreferredArea,
        updatePreferredArea,
        deletePreferredArea,
      }}
    >
      {children}

      {/* Global Toast */}
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "", visible: false })}
        />
      )}
    </PreferredAreasContext.Provider>
  );
};

export const usePreferredAreas = () => useContext(PreferredAreasContext);
