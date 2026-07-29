import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { API_BASE_URL } from "../../config/api";

const CustomerMatchingContext = createContext();
export const CustomerMatchingProvider = ({ children }) => {
  const { token } = useAuth();

  const [matchingShippers, setMatchingShippers] = useState([]);
  const [invitedShippers, setInvitedShippers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  // ── Fetch matching shippers ──────────────────────────────────────────────
  const fetchMatchingShippers = useCallback(
    async (shipmentId) => {
      if (!token || !shipmentId) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/customer/shipments/${shipmentId}/matching-shippers`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMatchingShippers(res.data?.shippers || []);
        setInvitedShippers(res.data?.invitedShippers || []);
      } catch (err) {
        setMatchingShippers([]);
        setInvitedShippers([]);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // ── Send invitation ──────────────────────────────────────────────────────
  const sendInvitation = useCallback(
    async ({ shipmentId, shipperId, message = "" }) => {
      if (!token || !shipmentId || !shipperId) {
        const error = new Error("Missing required parameters");
        throw error;
      }

      setInviteLoading(true);
      try {
        const res = await axios.post(
          `${API_BASE_URL}/customer/shipments/send-invitation`,
          { shipmentId, shipperId, message },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Mark as invited locally so button updates immediately
        setInvitedShippers((prev) => [...new Set([...prev, shipperId])]);
        return res.data;
      } catch (err) {
        throw err;
      } finally {
        setInviteLoading(false);
      }
    },
    [token]
  );

  return (
    <CustomerMatchingContext.Provider
      value={{
        matchingShippers,
        invitedShippers,
        loading,
        inviteLoading,
        fetchMatchingShippers,
        sendInvitation,
      }}
    >
      {children}
    </CustomerMatchingContext.Provider>
  );
};

export const useCustomerMatching = () => useContext(CustomerMatchingContext);
