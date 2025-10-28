import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

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

  // ----------------- Auto-login on page load -----------------
  useEffect(() => {
    const storedUser = localStorage.getItem("horseShiptUser");
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (storedUser && storedToken && storedRole) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setRole(storedRole);
    }
    setLoading(false);
  }, []);

  // ----------------- Normal Login -----------------
  const login = async ({ email, password, role, deviceId, location }) => {
    if (!role) return { success: false, errors: ["Role is required"] };
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email, password, role, deviceId, location },
        { withCredentials: true }
      );

      const userData = res.data.data;

      setUser(userData);
      setToken(userData.token);
      setRole(userData.role);

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

  // ----------------- Normal Signup -----------------
  const signup = async ({ name, email, password, role }) => {
    if (!role) return { success: false, errors: ["Role is required"] };
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/signup`,
        { name, email, password, role },
        { withCredentials: true }
      );

      const newUser = res.data.data;
      setUser(newUser);
      setToken(newUser.token);
      setRole(newUser.role);

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
    if (!user) return;
    try {
      await axios.post(
        `${API_BASE_URL}/auth/logout`,
        { role: user.role, userId: user._id },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout Error:", err.response?.data || err.message);
    } finally {
      setUser(null);
      setToken(null);
      setRole(null);
      localStorage.removeItem("horseShiptUser");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login", { replace: true });
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
    setRole(role);

    localStorage.setItem("horseShiptUser", JSON.stringify(oauthUser));
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
  };

  // ----------------- Handle OAuth redirect on mount -----------------
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    const id = query.get("id");
    const role = query.get("role");
    const name = query.get("name");
    const email = query.get("email");
    const photo = query.get("photo");
    const providerId = query.get("providerId");

    if (token && id && role) {
      oauthLogin({
        token,
        id,
        role,
        name,
        email,
        photo,
        provider: "google",
        providerId,
      });

      navigate(location.pathname, { replace: true });
    }
  }, [location.search]);

  // ----------------- Role Helpers -----------------
  const isCustomer = role === "customer";
  const isShipper = role === "shipper";

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        role,
        isCustomer,
        isShipper,
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
