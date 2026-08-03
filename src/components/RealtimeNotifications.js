import { useEffect, useRef } from "react";
import Toast from "./common/Toast";
import { socket } from "../services/socket";
import { useAuth } from "../contexts/AuthContext";
import { useNotificationActivity } from "../contexts/NotificationActivityContext";

const getChatUrl = (role) => {
  if (role === "shipper") return "/shipper/chat";
  if (role === "customer") return "/customer/chats";
  return "/";
};

const requestBrowserNotificationPermission = async () => {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;

  try {
    return await Notification.requestPermission();
  } catch (error) {
    console.error("Browser notification permission failed:", error);
    return Notification.permission;
  }
};

const showBrowserNotification = ({ notification, role }) => {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const title = notification.title || "HorseShipt";
  const body = notification.message || "You have a new notification.";
  const targetUrl = notification.url || getChatUrl(role);

  const browserNotification = new Notification(title, {
    body,
    icon: "/HorseShipt192.png",
    badge: "/HorseShipt192.png",
    tag: notification.id || `${notification.type || "notification"}:${Date.now()}`,
  });

  browserNotification.onclick = () => {
    window.focus();
    if (targetUrl && window.location.pathname !== targetUrl) {
      window.location.assign(targetUrl);
    }
    browserNotification.close();
  };
};

const RealtimeNotifications = () => {
  const { token, user, role } = useAuth();
  const permissionRequestedRef = useRef(false);
  const {
    initialized,
    saveIncomingNotification,
  } = useNotificationActivity();

  useEffect(() => {
    if (!token || !user?._id || !role || permissionRequestedRef.current) return;
    if (!["customer", "shipper"].includes(role)) return;

    permissionRequestedRef.current = true;
    requestBrowserNotificationPermission();
  }, [role, token, user?._id]);

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

      saveIncomingNotification(notification);

      if (initialized) {
        Toast.info(notification.message, 3500);
      }

      if (notification.type === "chat_message") {
        showBrowserNotification({ notification, role });
      }
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
  }, [
    initialized,
    role,
    saveIncomingNotification,
    token,
    user?._id,
  ]);

  return null;
};

export default RealtimeNotifications;
