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

/* ===============================
   Context Setup
================================ */
const PreferredAreasContext = createContext();

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://horse-shipt.vercel.app/api/shipper";

/* ===============================
   Provider
================================ */
export const PreferredAreasProvider = ({ children }) => {
  const { user, token } = useAuth();

  const [preferredAreas, setPreferredAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  /* ===============================
     Toast State
  ================================ */
  const [toast, setToast] = useState({
    message: "",
    type: "",
    visible: false,
  });

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type, visible: true });

    setTimeout(() => {
      setToast({ message: "", type: "", visible: false });
    }, 3000);
  }, []);

  /* ===============================
     Fetch Preferred Areas (FIXED)
  ================================ */
  const fetchPreferredAreas = useCallback(async () => {
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
  }, [token, user, fetched, showToast]);

  /* ===============================
     Add Preferred Area
  ================================ */
  const addPreferredArea = useCallback(
    async (formData) => {
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

        setFetched(false);
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
    },
    [token, user, fetchPreferredAreas, showToast]
  );

  /* ===============================
     Update Preferred Area
  ================================ */
  const updatePreferredArea = useCallback(
    async (id, formData) => {
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

        setFetched(false);
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
    },
    [token, user, fetchPreferredAreas, showToast]
  );

  /* ===============================
     Delete Preferred Area
  ================================ */
  const deletePreferredArea = useCallback(
    async (id) => {
      if (!token || user?.role !== "shipper") {
        showToast("Unauthorized. Please log in as a shipper.", "error");
        return { success: false };
      }

      setLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/preferred-areas/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFetched(false);
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
    },
    [token, user, fetchPreferredAreas, showToast]
  );

  /* ===============================
     Initial Fetch
  ================================ */
  useEffect(() => {
    if (user?.role === "shipper") {
      fetchPreferredAreas();
    } else {
      setPreferredAreas([]);
      setFetched(false);
    }
  }, [user, fetchPreferredAreas]);

  /* ===============================
     Provider
  ================================ */
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

/* ===============================
   Custom Hook
================================ */
export const usePreferredAreas = () => useContext(PreferredAreasContext);
