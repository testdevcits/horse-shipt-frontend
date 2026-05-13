import { useEffect, useRef } from "react";
import Toast from "./common/Toast";
import { socket } from "../services/socket";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchNotificationActivity,
  saveNotificationActivity,
} from "../utils/notificationActivity";

const POLLING_INTERVAL_MS = 15000;

const RealtimeNotifications = () => {
  const { token, user, role } = useAuth();
  const seenNotificationIdsRef = useRef(new Set());
  const pollingInitializedRef = useRef(false);

  useEffect(() => {
    if (!token || !user?._id || !role) return;

    seenNotificationIdsRef.current = new Set();
    pollingInitializedRef.current = false;

    const joinRoom = () => {
      socket.emit("horse_shipt:join_user_room", {
        userId: user._id,
        role,
      });
    };

    const handleNotification = (notification) => {
      if (!notification?.message) return;
      const saved = saveNotificationActivity({
        role,
        userId: user._id,
        notification,
      });
      saved.forEach((item) => seenNotificationIdsRef.current.add(item.id));
      window.dispatchEvent(new Event("horse_shipt:notification_activity"));
      Toast.info(notification.message, 3500);
    };

    const pollNotifications = async () => {
      try {
        const { notifications } = await fetchNotificationActivity({
          role,
          userId: user._id,
          token,
        });

        const newNotifications = notifications.filter(
          (item) => item?.id && !seenNotificationIdsRef.current.has(item.id)
        );

        notifications.forEach((item) => {
          if (item?.id) seenNotificationIdsRef.current.add(item.id);
        });

        if (pollingInitializedRef.current) {
          newNotifications
            .filter((item) => !item.read)
            .slice(0, 3)
            .forEach((item) => Toast.info(item.message, 3500));
        }

        pollingInitializedRef.current = true;
        window.dispatchEvent(new Event("horse_shipt:notification_activity"));
      } catch (error) {
        // Socket may still work; polling will retry on the next interval.
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        pollNotifications();
      }
    };

    const handleWindowFocus = () => {
      pollNotifications();
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.connect();
    }

    socket.on("connect", joinRoom);
    socket.on("horse_shipt:notification", handleNotification);
    pollNotifications();
    const pollTimer = setInterval(pollNotifications, POLLING_INTERVAL_MS);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      clearInterval(pollTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      socket.off("connect", joinRoom);
      socket.off("horse_shipt:notification", handleNotification);
    };
  }, [token, user?._id, role]);

  return null;
};

export default RealtimeNotifications;
