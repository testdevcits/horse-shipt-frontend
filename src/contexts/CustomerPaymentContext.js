import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

const CustomerPaymentContext = createContext();

// ---------------- Custom Hook ----------------
export const useCustomerPayment = () => useContext(CustomerPaymentContext);

// ---------------- Provider ----------------
export const CustomerPaymentProvider = ({ children }) => {
  const { user } = useAuth();

  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  // ---------------- Fetch payment for logged-in customer ----------------
  const fetchPayment = async () => {
    if (!user?.token || user?.role !== "customer") return;

    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/customer/payment`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (res.data?.data) {
        setPaymentData(res.data.data);
      } else {
        setPaymentData(null);
      }
    } catch (err) {
      console.error("[Fetch Payment] Error:", err.response || err.message);
      setPaymentData(null);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Auto fetch when customer logs in ----------------
  useEffect(() => {
    if (user && user.role === "customer") {
      fetchPayment();
    } else {
      setPaymentData(null); // clear data if logged-out or different role
    }
  }, [user]);

  // ---------------- OTP cooldown timer ----------------
  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setInterval(() => setOtpCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // ---------------- Send OTP ----------------
  const sendOtp = async ({ pkLive, skLive, paymentId }) => {
    if (!user?.token)
      return { success: false, message: "User not authenticated" };

    try {
      setLoading(true);
      await axios.post(
        `${API_BASE_URL}/customer/payment/request-otp`,
        { pkLive, skLive, paymentId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setOtpSent(true);
      setOtpCooldown(30);
      return { success: true };
    } catch (err) {
      console.error("[Send OTP] Error:", err.response || err.message);
      return {
        success: false,
        message: err.response?.data?.message || "Failed to send OTP",
      };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Verify OTP ----------------
  const verifyOtp = async ({ otp, pkLive, skLive, paymentId }) => {
    if (!user?.token)
      return { success: false, message: "User not authenticated" };

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/customer/payment/verify-otp`,
        { otp, pkLive, skLive, paymentId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setPaymentData(res.data.data);
      setOtpSent(false);
      return { success: true, message: res.data.message };
    } catch (err) {
      console.error("[Verify OTP] Error:", err.response || err.message);
      return {
        success: false,
        message: err.response?.data?.message || "OTP verification failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Provider Value ----------------
  return (
    <CustomerPaymentContext.Provider
      value={{
        paymentData,
        setPaymentData,
        loading,
        otpSent,
        otpCooldown,
        fetchPayment,
        sendOtp,
        verifyOtp,
        setOtpSent,
        setOtpCooldown,
      }}
    >
      {children}
    </CustomerPaymentContext.Provider>
  );
};
