import { useEffect } from "react";
import Toast from "./common/Toast";
import { socket } from "../services/socket";
import { useAuth } from "../contexts/AuthContext";

const RealtimeNotifications = () => {
  const { token, user, role } = useAuth();

  useEffect(() => {
    if (!token || !user?._id || !role) return;

    const joinRoom = () => {
      socket.emit("horse_shipt:join_user_room", {
        userId: user._id,
        role,
      });
    };

    const handleNotification = (notification) => {
      if (!notification?.message) return;
      Toast.info(notification.message, 3500);
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.connect();
    }

    socket.on("connect", joinRoom);
    socket.on("horse_shipt:notification", handleNotification);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("horse_shipt:notification", handleNotification);
    };
  }, [token, user?._id, role]);

  return null;
};

export default RealtimeNotifications;
