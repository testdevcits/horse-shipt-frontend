import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

const CustomerMatchingContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api";

export const CustomerMatchingProvider = ({ children }) => {
  const { token } = useAuth();

  const [matchingShippers, setMatchingShippers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  // ============================
  // FETCH MATCHING SHIPPERS
  // ============================
  const fetchMatchingShippers = useCallback(
    async (shipmentId) => {
      if (!token || !shipmentId) return;

      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/customer/shipments/${shipmentId}/matching-shippers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMatchingShippers(res.data?.shippers || []);
      } catch (err) {
        console.error("Matching shippers error:", err);
        setMatchingShippers([]);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // ============================
  // SEND INVITATION
  // ============================
  const sendInvitation = useCallback(
    async ({ shipmentId, shipperId, message = "" }) => {
      if (!token || !shipmentId || !shipperId) return;

      setInviteLoading(true);
      try {
        const res = await axios.post(
          `${API_BASE_URL}/customer/shipments/send-invitation`,
          {
            shipmentId,
            shipperId,
            message,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        return res.data;
      } catch (err) {
        console.error("Send invitation error:", err);
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
