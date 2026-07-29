import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { API_BASE_URL } from "../config/api";

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
};

/* ===============================
   Context Setup
================================ */
const CustomerNotificationContext = createContext();

const VAPID_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;

/* ===============================
   Provider
================================ */
export const CustomerNotificationProvider = ({ children }) => {
  const { token, user } = useAuth();

  const [notifications, setNotifications] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  /* ===============================
     Fetch Notifications
  ================================ */
  const fetchNotifications = useCallback(async () => {
    if (!user || !token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/customer/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const data = res.data.data || {};
        setNotifications(data);
        setNotificationCount(Object.values(data).filter(Boolean).length);
      } else {
        setError(res.data.message || "Failed to fetch notifications");
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  /* ===============================
     Update Single Notification
  ================================ */
  const updateNotification = useCallback(
    async (type, value) => {
      if (!user || !token) return;

      try {
        const res = await axios.put(
          `${API_BASE_URL}/customer/notifications/${type}`,
          { value },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          const data = res.data.data || {};
          setNotifications(data);
          setNotificationCount(Object.values(data).filter(Boolean).length);
        } else {
          setError(res.data.message || "Failed to update notification");
        }
      } catch (err) {
        console.error("Update notification error:", err);
        setError(err.response?.data?.message || err.message);
      }
    },
    [user, token]
  );

  /* ===============================
     Subscribe to Push Notifications
  ================================ */
  const subscribeToPush = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !token) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
        });
      }

      await axios.post(
        `${API_BASE_URL}/customer/notifications/subscribe`,
        { subscription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Push subscription failed:", err);
      setError("Push subscription failed. Please allow notifications.");
    }
  }, [token]);

  /* ===============================
     Effect: Run for logged-in customers
  ================================ */
  useEffect(() => {
    if (user && token && user.role === "customer") {
      fetchNotifications();
      subscribeToPush();
    }
  }, [user, token, fetchNotifications, subscribeToPush]);

  /* ===============================
     Provider Value
  ================================ */
  return (
    <CustomerNotificationContext.Provider
      value={{
        notifications,
        loading,
        error,
        notificationCount,
        fetchNotifications,
        updateNotification,
      }}
    >
      {children}
    </CustomerNotificationContext.Provider>
  );
};

/* ===============================
   Custom Hook
================================ */
export const useCustomerNotifications = () =>
  useContext(CustomerNotificationContext);
