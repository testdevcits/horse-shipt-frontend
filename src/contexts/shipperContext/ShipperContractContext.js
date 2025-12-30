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

const ShipperContractContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api";

export const ShipperContractProvider = ({ children }) => {
  const { token } = useAuth();

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const showToast = (message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  };

  // ---------------- FETCH CONTRACTS ----------------
  const fetchContracts = useCallback(async () => {
    if (!token || hasFetched) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/shipper/contracts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setContracts(res.data.data ? [res.data.data] : []);
      setHasFetched(true);
    } catch (err) {
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [token, hasFetched]); // ✅ stable reference for useEffect

  // 🔥 Auto-call once when token is available
  useEffect(() => {
    fetchContracts(); // ✅ no ESLint warning now
  }, [fetchContracts]);

  // ---------------- UPLOAD CONTRACT ----------------
  const uploadContract = async (formData) => {
    if (!token) return;

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/shipper/contracts/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      showToast("Contract uploaded successfully", "success");

      // refresh
      setHasFetched(false);
      fetchContracts();

      return { success: true };
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to upload contract",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- DEACTIVATE CONTRACT ----------------
  const deactivateContract = async () => {
    if (!token) return;

    setLoading(true);
    try {
      await axios.patch(
        `${API_BASE_URL}/shipper/contracts/deactivate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("Contract deactivated", "success");

      setHasFetched(false);
      fetchContracts();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to deactivate contract",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShipperContractContext.Provider
      value={{
        contracts,
        loading,
        uploadContract,
        deactivateContract,
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
    </ShipperContractContext.Provider>
  );
};

export const useShipperContract = () => useContext(ShipperContractContext);
