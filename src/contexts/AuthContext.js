import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ----------------- Auto-login on page load -----------------
  useEffect(() => {
    const storedUser = localStorage.getItem("horseShiptUser");
    const storedToken = localStorage.getItem("token");
    const storedId = localStorage.getItem("userId");

    if (storedUser && storedToken && storedId) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
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

      // store in localStorage
      localStorage.setItem("horseShiptUser", JSON.stringify(userData));
      localStorage.setItem("token", userData.token);
      localStorage.setItem("role", userData.role);
      localStorage.setItem("userId", userData._id); // <-- store user id separately

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

      // store in localStorage
      localStorage.setItem("horseShiptUser", JSON.stringify(newUser));
      localStorage.setItem("token", newUser.token);
      localStorage.setItem("role", newUser.role);
      localStorage.setItem("userId", newUser._id); // <-- store user id separately

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
      localStorage.removeItem("horseShiptUser");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId"); // <-- remove user id on logout
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
    _id,
  }) => {
    if (!token || !role) return;

    const oauthUser = {
      _id: _id || "",
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

    // store in localStorage
    localStorage.setItem("horseShiptUser", JSON.stringify(oauthUser));
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("userId", _id || ""); // <-- store user id
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
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
