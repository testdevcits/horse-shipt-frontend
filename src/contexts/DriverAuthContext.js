import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const DriverAuthContext = createContext();

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

export const DriverAuthProvider = ({ children }) => {
  const [driver, setDriver] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("driverToken") || "");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // ----------------- Auto-login on mount -----------------
  useEffect(() => {
    const storedToken = localStorage.getItem("driverToken");
    const storedDriver = localStorage.getItem("driverData");

    if (storedToken && storedDriver) {
      setToken(storedToken);
      setDriver(JSON.parse(storedDriver));
    }
    setLoading(false);
  }, []);

  // ----------------- Driver Login -----------------
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/driver/driver/login`, {
        email,
        password,
      });
      if (res.data.success) {
        const { token, driver } = res.data;

        setToken(token);
        setDriver(driver);

        localStorage.setItem("driverToken", token);
        localStorage.setItem("driverData", JSON.stringify(driver));

        navigate("/driver/dashboard", { replace: true });
      }
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      console.error("Driver Login Error:", err.response?.data || err.message);
      return {
        success: false,
        message: err.response?.data?.message || err.message,
      };
    }
  };

  // ----------------- Fetch Driver Details -----------------
  const fetchDriver = async () => {
    if (!token) return { success: false, message: "No token found" };

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/driver/driver/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) setDriver(res.data.driver);

      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      console.error("Fetch Driver Error:", err.response?.data || err.message);
      return {
        success: false,
        message: err.response?.data?.message || err.message,
      };
    }
  };

  // ----------------- Auto fetch driver on token change -----------------
  useEffect(() => {
    if (token) fetchDriver();
  }, [token]);

  // ----------------- Logout -----------------
  const logout = () => {
    setDriver(null);
    setToken("");
    localStorage.removeItem("driverToken");
    localStorage.removeItem("driverData");
    navigate("/driver/login", { replace: true });
  };

  return (
    <DriverAuthContext.Provider
      value={{
        driver,
        token,
        loading,
        login,
        fetchDriver,
        logout,
      }}
    >
      {children}
    </DriverAuthContext.Provider>
  );
};

export const useDriverAuth = () => useContext(DriverAuthContext);
