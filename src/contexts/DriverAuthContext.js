import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DriverAuthContext = createContext();

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

export const DriverAuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [driver, setDriver] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("driverToken") || ""
  );
  const [loading, setLoading] = useState(true);

  // ====================================================
  // AUTO LOGIN (ON APP LOAD)
  // ====================================================
  useEffect(() => {
    const storedToken = localStorage.getItem("driverToken");
    const storedDriver = localStorage.getItem("driverData");

    if (storedToken && storedDriver) {
      setToken(storedToken);
      setDriver(JSON.parse(storedDriver));
    }

    setLoading(false);
  }, []);

  // ====================================================
  // DRIVER LOGIN
  // ====================================================
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

      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message,
      };
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // FETCH DRIVER (ME)
  // ====================================================
  const fetchDriver = useCallback(async () => {
    if (!token) return;

    try {
      const res = await axios.get(`${API_BASE_URL}/driver/driver/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setDriver(res.data.driver);
        localStorage.setItem("driverData", JSON.stringify(res.data.driver));
      }
    } catch (err) {
      console.error("[FETCH DRIVER]", err.response?.data || err.message);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchDriver();
  }, [token, fetchDriver]);

  // ====================================================
  // UPLOAD DRIVER PROFILE IMAGE
  // ====================================================
  const uploadProfileImage = async (file) => {
    if (!file || !token) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.put(
        `${API_BASE_URL}/driver/driver/profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        const updatedDriver = {
          ...driver,
          profileImage: res.data.driver.profileImage,
        };

        setDriver(updatedDriver);
        localStorage.setItem("driverData", JSON.stringify(updatedDriver));
      }

      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message,
      };
    }
  };

  // ====================================================
  // DELETE DRIVER PROFILE IMAGE
  // ====================================================
  const deleteProfileImage = async () => {
    if (!token) return;

    try {
      const res = await axios.delete(
        `${API_BASE_URL}/driver/driver/profile-image`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        const updatedDriver = {
          ...driver,
          profileImage: { url: null, public_id: null },
        };

        setDriver(updatedDriver);
        localStorage.setItem("driverData", JSON.stringify(updatedDriver));
      }

      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message,
      };
    }
  };

  // ====================================================
  // LOGOUT
  // ====================================================
  const logout = () => {
    setDriver(null);
    setToken("");
    localStorage.removeItem("driverToken");
    localStorage.removeItem("driverData");
    navigate("/driver/login", { replace: true });
  };

  // ====================================================
  // CONTEXT PROVIDER
  // ====================================================
  return (
    <DriverAuthContext.Provider
      value={{
        driver,
        token,
        loading,
        login,
        fetchDriver,
        uploadProfileImage,
        deleteProfileImage,
        logout,
      }}
    >
      {children}
    </DriverAuthContext.Provider>
  );
};

export const useDriverAuth = () => useContext(DriverAuthContext);
