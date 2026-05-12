import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { socket } from "../services/socket";

const AuthContext = createContext();

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  /* ===============================
     AUTO LOGIN (REFRESH)
  ================================ */
  useEffect(() => {
    const storedUser = localStorage.getItem("horseShiptUser");
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (storedUser && storedToken && storedRole) {
      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);
      setToken(storedToken);
      setRole(storedRole);

      socket.auth = {
        userId: parsedUser._id,
        role: storedRole,
      };
      socket.connect();
    }

    setLoading(false);
  }, []);

  /* ===============================
     SOCKET CLEANUP
  ================================ */
  useEffect(() => {
    return () => {
      if (socket.connected) socket.disconnect();
    };
  }, []);

  const completeAuth = (userData) => {
    setUser(userData);
    setToken(userData.token);
    setRole(userData.role);

    localStorage.setItem("horseShiptUser", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);
    localStorage.setItem("role", userData.role);

    socket.auth = {
      userId: userData._id,
      role: userData.role,
    };
    socket.connect();
  };

  /* ===============================
     LOGIN
  ================================ */
  const login = async ({ email, password, role, deviceId, location }) => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email, password, role, deviceId, location },
        { withCredentials: true }
      );

      const userData = res.data.data;
      completeAuth(userData);

      return { success: true, data: userData };
    } catch (err) {
      return {
        success: false,
        errors: err.response?.data?.errors || ["Server Error"],
      };
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     SIGNUP
  ================================ */
  const signup = async ({ name, email, password, role }) => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${API_BASE_URL}/auth/signup`,
        { name, email, password, role },
        { withCredentials: true }
      );

      if (res.data.requiresOtp) {
        return {
          success: true,
          requiresOtp: true,
          message: res.data.message,
          data: res.data.data,
        };
      }

      const userData = res.data.data;
      completeAuth(userData);

      return { success: true, data: userData };
    } catch (err) {
      return {
        success: false,
        errors: err.response?.data?.errors || ["Server Error"],
      };
    } finally {
      setLoading(false);
    }
  };

  const verifySignupOtp = async ({ email, role, otp }) => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${API_BASE_URL}/auth/signup/verify-otp`,
        { email, role, otp },
        { withCredentials: true }
      );

      const userData = res.data.data;
      completeAuth(userData);

      return { success: true, data: userData, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        errors: err.response?.data?.errors || ["Server Error"],
      };
    } finally {
      setLoading(false);
    }
  };

  const resendSignupOtp = async ({ email, role }) => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${API_BASE_URL}/auth/signup/resend-otp`,
        { email, role },
        { withCredentials: true }
      );

      return {
        success: true,
        requiresOtp: true,
        data: res.data.data,
        message: res.data.message,
      };
    } catch (err) {
      return {
        success: false,
        errors: err.response?.data?.errors || ["Server Error"],
      };
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     LOGOUT
  ================================ */
  const logout = async () => {
    try {
      if (user) {
        await axios.post(
          `${API_BASE_URL}/auth/logout`,
          { role: user.role, userId: user._id },
          { withCredentials: true }
        );
      }
    } catch (err) {
      console.error("Logout Error:", err);
    } finally {
      if (socket.connected) socket.disconnect();

      setUser(null);
      setToken(null);
      setRole(null);

      localStorage.removeItem("horseShiptUser");
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      navigate("/login", { replace: true });
    }
  };

  /* ===============================
     OAUTH LOGIN (FIXED)
  ================================ */
  const oauthLogin = ({ token }) => {
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      const oauthUser = {
        _id: payload.id,
        role: payload.role,
        isLogin: true,
      };

      setUser(oauthUser);
      setToken(token);
      setRole(payload.role);

      localStorage.setItem("horseShiptUser", JSON.stringify(oauthUser));
      localStorage.setItem("token", token);
      localStorage.setItem("role", payload.role);

      socket.auth = {
        userId: payload.id,
        role: payload.role,
      };
      socket.connect();
    } catch (err) {
      console.error("OAuth parse error:", err);
    }
  };

  /* ===============================
     HANDLE OAUTH REDIRECT (FIXED)
  ================================ */
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tokenParam = query.get("token");

    if (tokenParam) {
      oauthLogin({ token: tokenParam });

      // clean URL
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);

  /* ===============================
     ROLE HELPERS
  ================================ */
  const isCustomer = role === "customer";
  const isShipper = role === "shipper";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isCustomer,
        isShipper,
        loading,
        login,
        signup,
        verifySignupOtp,
        resendSignupOtp,
        logout,
        oauthLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
