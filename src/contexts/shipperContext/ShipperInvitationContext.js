import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { socket } from "../../services/socket";
import { API_BASE_URL } from "../../config/api";

const ShipperInvitationContext = createContext();
export const ShipperInvitationProvider = ({ children }) => {
  const { token, user, isShipper } = useAuth();

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

  useEffect(() => {
    if (!token || !isShipper || !user?._id) return;

    const joinRoom = () => {
      socket.emit("horse_shipt:join_user_room", {
        userId: user._id,
        role: "shipper",
      });
    };

    const handleNewInvitation = (invitation) => {
      setInvitations((prev) => {
        if (prev.some((item) => item._id === invitation._id)) return prev;
        return [invitation, ...prev];
      });
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.connect();
    }

    socket.on("connect", joinRoom);
    socket.on(
      "horse_shipt:shipment_invitation_created",
      handleNewInvitation
    );

    return () => {
      socket.off("connect", joinRoom);
      socket.off(
        "horse_shipt:shipment_invitation_created",
        handleNewInvitation
      );
    };
  }, [token, isShipper, user?._id]);

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
