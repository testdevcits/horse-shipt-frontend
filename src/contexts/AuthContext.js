import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // loading state

  // ----------------- Auto-login -----------------
  useEffect(() => {
    const storedUser = localStorage.getItem("horseShiptUser");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  // ----------------- Login -----------------
  const login = async (credentials) => {
    setLoading(true);
    try {
      let userData;

      if (credentials.token) {
        // OAuth login
        userData = credentials;
      } else {
        // Normal form login
        const res = await axios.post(
          `${API_BASE_URL}/auth/login`,
          credentials,
          {
            withCredentials: true,
          }
        );
        userData = res.data.data;
      }

      setUser(userData);
      setToken(userData.token);

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
    } finally {
      setLoading(false);
    }
  };

  // ----------------- Signup -----------------
  const signup = async (userData) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/signup`, userData, {
        withCredentials: true,
      });
      const newUser = res.data.data;

      setUser(newUser);
      setToken(newUser.token);

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
    } finally {
      setLoading(false);
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
      setToken(null);
      localStorage.removeItem("horseShiptUser");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    } catch (err) {
      console.error("Logout Error:", err.response?.data || err.message);
    }
  };

  // ----------------- OAuth Login -----------------
  const oauthLogin = ({
    token,
    role,
    provider,
    providerId,
    email,
    name,
    photo,
    id,
  }) => {
    if (!token || !role) return;

    const oauthUser = {
      _id: id || "",
      token,
      role,
      provider,
      providerId,
      email,
      name,
      photo,
      isLogin: true,
    };

    setUser(oauthUser);
    setToken(token);

    localStorage.setItem("horseShiptUser", JSON.stringify(oauthUser));
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        oauthLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
