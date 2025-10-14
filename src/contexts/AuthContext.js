import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ----------------- Auto-login -----------------
  useEffect(() => {
    const storedUser = localStorage.getItem("horseShiptUser");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // ----------------- Login -----------------
  const login = async ({ email, password }) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      const userData = res.data.data;
      setUser(userData);
      localStorage.setItem("horseShiptUser", JSON.stringify(userData));
      localStorage.setItem("token", userData.token);
      localStorage.setItem("role", userData.role);

      return { success: true };
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      return {
        success: false,
        errors: err.response?.data?.errors || ["Server Error"],
      };
    }
  };

  // ----------------- Signup -----------------
  const signup = async (userData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/signup`, userData, {
        withCredentials: true,
      });

      const newUser = res.data.data;
      setUser(newUser);
      localStorage.setItem("horseShiptUser", JSON.stringify(newUser));
      localStorage.setItem("token", newUser.token);
      localStorage.setItem("role", newUser.role);

      return { success: true };
    } catch (err) {
      console.error("Signup Error:", err.response?.data || err.message);
      return {
        success: false,
        errors: err.response?.data?.errors || ["Server Error"],
      };
    }
  };

  // ----------------- Logout -----------------
  const logout = async () => {
    try {
      if (!user) return;

      await axios.post(
        `${API_BASE_URL}/auth/logout`,
        { role: user.role, userId: user._id },
        { withCredentials: true }
      );

      setUser(null);
      localStorage.removeItem("horseShiptUser");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    } catch (err) {
      console.error("Logout Error:", err.response?.data || err.message);
    }
  };

  // ----------------- OAuth Login -----------------
  const oauthLogin = (queryParams) => {
    const { token, role, provider, providerId, email, name, photo } =
      queryParams;

    const oauthUser = { token, role, provider, providerId, email, name, photo };
    setUser(oauthUser);
    localStorage.setItem("horseShiptUser", JSON.stringify(oauthUser));
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, oauthLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
