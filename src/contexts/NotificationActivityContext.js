import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import {
  deleteNotificationActivity,
  fetchNotificationActivity,
  loadNotificationActivity,
  markNotificationActivityReadRemote,
  saveNotificationActivity,
} from "../utils/notificationActivity";

const NotificationActivityContext = createContext(null);

const POLLING_INTERVAL_MS = 15000;

export const NotificationActivityProvider = ({ children }) => {
  const { token, user, role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const seenNotificationIdsRef = useRef(new Set());

  const userId = user?._id;

  const loadLocal = useCallback(() => {
    const activity = loadNotificationActivity({ role, userId });
    setNotifications(activity);
    setUnreadCount(activity.filter((item) => !item.read).length);
    return activity;
  }, [role, userId]);

  const refresh = useCallback(
    async ({ force = false, silent = false } = {}) => {
      if (!role || !userId || !token) {
        loadLocal();
        return { notifications: [], unreadCount: 0 };
      }

      if (!silent) setLoading(true);

      try {
        const result = await fetchNotificationActivity({
          role,
          userId,
          token,
          force,
        });

        setNotifications(result.notifications);
        setUnreadCount(result.unreadCount);
        result.notifications.forEach((item) => {
          if (item?.id) seenNotificationIdsRef.current.add(item.id);
        });
        setInitialized(true);
        return result;
      } catch (error) {
        const activity = loadLocal();
        return {
          notifications: activity,
          unreadCount: activity.filter((item) => !item.read).length,
        };
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [loadLocal, role, token, userId]
  );

  const saveIncomingNotification = useCallback(
    (notification) => {
      if (!role || !userId || !notification?.message) return [];

      const next = saveNotificationActivity({ role, userId, notification });
      setNotifications(next);
      setUnreadCount(next.filter((item) => !item.read).length);
      next.forEach((item) => {
        if (item?.id) seenNotificationIdsRef.current.add(item.id);
      });
      return next;
    },
    [role, userId]
  );

  const markAllRead = useCallback(async () => {
    if (!role || !userId) return;

    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);

    await markNotificationActivityReadRemote({ role, userId, token });
  }, [role, token, userId]);

  const deleteNotification = useCallback(
    async (notificationId) => {
      if (!role || !userId || !notificationId) return;

      setNotifications((prev) => {
        const next = prev.filter((item) => item.id !== notificationId);
        setUnreadCount(next.filter((item) => !item.read).length);
        return next;
      });

      await deleteNotificationActivity({
        role,
        userId,
        token,
        notificationId,
      });
    },
    [role, token, userId]
  );

  useEffect(() => {
    seenNotificationIdsRef.current = new Set();
    setInitialized(false);
    loadLocal();
    refresh({ silent: true });
  }, [loadLocal, refresh]);

  useEffect(() => {
    if (!role || !userId || !token) return undefined;

    const poll = () => refresh({ silent: true });
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refresh({ force: true, silent: true });
      }
    };
    const handleFocus = () => refresh({ force: true, silent: true });

    const timer = setInterval(poll, POLLING_INTERVAL_MS);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refresh, role, token, userId]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      initialized,
      seenNotificationIdsRef,
      refresh,
      saveIncomingNotification,
      markAllRead,
      deleteNotification,
    }),
    [
      deleteNotification,
      initialized,
      loading,
      markAllRead,
      notifications,
      refresh,
      saveIncomingNotification,
      unreadCount,
    ]
  );

  return (
    <NotificationActivityContext.Provider value={value}>
      {children}
    </NotificationActivityContext.Provider>
  );
};

export const useNotificationActivity = () =>
  useContext(NotificationActivityContext);
