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
     AUTO LOGIN (PAGE REFRESH)
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

      // 🔹 Socket connect on refresh
      socket.auth = {
        userId: parsedUser._id,
        role: storedRole,
      };
      socket.connect();
    }

    setLoading(false);
  }, []);

  /* ===============================
     SOCKET CLEANUP ON LOGOUT / UNMOUNT
  ================================ */
  useEffect(() => {
    return () => {
      if (socket.connected) socket.disconnect();
    };
  }, []);

  /* ===============================
     LOGIN
  ================================ */
  const login = async (payload) => {
    const { email, password, role, deviceId, location } = payload;

    if (!role) return { success: false, errors: ["Role is required"] };

    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/login`,
        {
          email,
          password,
          role,
          deviceId: deviceId || "web",
          location: location || "India",
        },
        { withCredentials: true }
      );

      const userData = res.data?.data;

      if (!userData?.token) {
        return { success: false, errors: ["Invalid server response"] };
      }

      // Save user data locally
      setUser(userData);
      setToken(userData.token);
      setRole(userData.role);

      localStorage.setItem("horseShiptUser", JSON.stringify(userData));
      localStorage.setItem("token", userData.token);
      localStorage.setItem("role", userData.role);

      // Connect socket if not already connected
      if (!socket.connected) {
        socket.auth = { userId: userData._id, role: userData.role };
        socket.connect();
      }

      return { success: true, data: userData };
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);

      const backendErrors =
        err.response?.data?.errors ||
        (err.response?.data?.message
          ? [err.response.data.message]
          : ["Invalid credentials"]);

      return { success: false, errors: backendErrors };
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     SIGNUP
  ================================ */
  const signup = async ({ name, email, password, role }) => {
    if (!role) return { success: false, errors: ["Role is required"] };

    setLoading(true);
    try {
      // Make POST request to signup endpoint
      const res = await axios.post(
        `${API_BASE_URL}/auth/signup`,
        { name, email, password, role }, // Only required fields
        { withCredentials: true }
      );

      const newUser = res.data.data;

      // Save user data locally
      setUser(newUser);
      setToken(newUser.token);
      setRole(newUser.role);

      localStorage.setItem("horseShiptUser", JSON.stringify(newUser));
      localStorage.setItem("token", newUser.token);
      localStorage.setItem("role", newUser.role);

      // Connect socket after signup
      socket.auth = { userId: newUser._id, role: newUser.role };
      socket.connect();

      return { success: true, data: newUser };
    } catch (err) {
      console.error("Signup Error:", err.response?.data || err.message);

      // Merge errors and message
      const backendErrors =
        err.response?.data?.errors ||
        (err.response?.data?.message
          ? [err.response.data.message]
          : ["Server Error"]);

      return { success: false, errors: backendErrors };
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     LOGOUT
  ================================ */
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
      if (socket.connected) socket.disconnect();

      setUser(null);
      setToken(null);
      setRole(null);

      localStorage.removeItem("horseShiptUser");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      sessionStorage.removeItem("stripeModalShown");

      navigate("/login", { replace: true });
    }
  };

  /* ===============================
     OAUTH LOGIN
  ================================ */
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

    // 🔹 Socket connect for OAuth
    socket.auth = { userId: oauthUser._id, role: oauthUser.role };
    socket.connect();
  };

  /* ===============================
     HANDLE OAUTH REDIRECT
  ================================ */
  useEffect(() => {
    const query = new URLSearchParams(location.search);

    const error = query.get("error");

    // If error exists → do nothing here (LoginPage handle karega)
    if (error) return;

    const tokenParam = query.get("token");
    const id = query.get("id");
    const roleParam = query.get("role");

    if (tokenParam && id && roleParam) {
      oauthLogin({
        token: tokenParam,
        id,
        role: roleParam,
        name: query.get("name"),
        email: query.get("email"),
        photo: query.get("photo"),
        provider: "google",
        providerId: query.get("providerId"),
      });

      //  clean URL
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
        logout,
        oauthLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
