import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

const ShipperInvitationContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api";

export const ShipperInvitationProvider = ({ children }) => {
  const { token } = useAuth();

  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);

  // ============================
  // FETCH MY INVITATIONS
  // ============================
  const fetchInvitations = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/shipper/invitations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setInvitations(res.data?.data || []);
    } catch (err) {
      console.error("Fetch invitations error:", err);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  return (
    <ShipperInvitationContext.Provider
      value={{
        invitations,
        loading,
        fetchInvitations,
      }}
    >
      {children}
    </ShipperInvitationContext.Provider>
  );
};

export const useShipperInvitations = () => useContext(ShipperInvitationContext);
