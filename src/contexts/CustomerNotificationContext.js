import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";

// ---------------- Utility: Convert VAPID key ----------------
const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
};

// ---------------- Context Setup ----------------
const CustomerNotificationContext = createContext();
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

// ---------------- Provider ----------------
export const CustomerNotificationProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0); // NEW: count of notifications

  // ---------------- Fetch notification settings ----------------
  const fetchNotifications = async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/customer/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setNotifications(res.data.data);
        // Count notifications that are enabled (true)
        const count = Object.values(res.data.data).filter(Boolean).length;
        setNotificationCount(count);
      } else {
        setError(res.data.message || "Failed to fetch notifications");
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Update a single notification ----------------
  const updateNotification = async (type, value) => {
    if (!user || !token) return;
    try {
      const res = await axios.put(
        `${API_BASE_URL}/customer/notifications/${type}`,
        { value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setNotifications(res.data.data);
        const count = Object.values(res.data.data).filter(Boolean).length;
        setNotificationCount(count);
      } else {
        setError(res.data.message || "Failed to update notification");
      }
    } catch (err) {
      console.error("Update notification error:", err);
      setError(err.response?.data?.message || err.message);
    }
  };

  // ---------------- Subscribe to push notifications ----------------
  const subscribeToPush = async () => {
    if (!("serviceWorker" in navigator) || !token) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      // Subscribe only if no existing subscription
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.REACT_APP_VAPID_PUBLIC_KEY
          ),
        });
      }

      // Send subscription to backend
      await axios.post(
        `${API_BASE_URL}/customer/notifications/subscribe`,
        { subscription },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Subscribed to push notifications successfully!");
    } catch (err) {
      console.error("Push subscription failed:", err);
      setError("Push subscription failed. Please allow notifications.");
    }
  };

  // ---------------- Effect: fetch notifications + subscribe ----------------
  useEffect(() => {
    if (user && token) {
      fetchNotifications();
      subscribeToPush();
    }
  }, [user, token]);

  // ---------------- Provider Value ----------------
  return (
    <CustomerNotificationContext.Provider
      value={{
        notifications,
        loading,
        error,
        notificationCount, // NEW
        fetchNotifications,
        updateNotification,
      }}
    >
      {children}
    </CustomerNotificationContext.Provider>
  );
};

// ---------------- Custom Hook ----------------
export const useCustomerNotifications = () =>
  useContext(CustomerNotificationContext);
