import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";

const CustomerNotificationContext = createContext();
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

export const CustomerNotificationProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/customer/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setNotifications(res.data.data);
      else setError(res.data.message || "Failed to fetch notifications");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateNotification = async (type, value) => {
    if (!user || !token) return;
    try {
      const res = await axios.put(
        `${API_BASE_URL}/customer/notifications/${type}`,
        { value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) setNotifications(res.data.data);
      else setError(res.data.message || "Failed to update notification");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user, token]);

  return (
    <CustomerNotificationContext.Provider
      value={{
        notifications,
        loading,
        error,
        fetchNotifications,
        updateNotification,
      }}
    >
      {children}
    </CustomerNotificationContext.Provider>
  );
};

export const useCustomerNotifications = () =>
  useContext(CustomerNotificationContext);
