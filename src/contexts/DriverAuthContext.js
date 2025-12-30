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

  const [driver, setDriver] = useState(
    () => JSON.parse(localStorage.getItem("driverData")) || null
  );
  const [shipments, setShipments] = useState(
    () => JSON.parse(localStorage.getItem("driverShipments")) || []
  );
  const [token, setToken] = useState(
    () => localStorage.getItem("driverToken") || ""
  );
  const [role, setRole] = useState(
    () => localStorage.getItem("driverRole") || "driver"
  );
  const [loading, setLoading] = useState(true);

  // ====================================================
  // FETCH DRIVER + SHIPMENTS (ME)
  // ====================================================
  const fetchDriver = useCallback(
    async (overrideToken) => {
      const authToken = overrideToken || token;
      if (!authToken) return;

      try {
        const res = await axios.get(`${API_BASE_URL}/driver/driver/me`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (res.data.success) {
          const driverData = res.data.driver;
          const shipmentsData = res.data.shipments || [];

          setDriver(driverData);
          setShipments(shipmentsData);

          // persist locally
          localStorage.setItem("driverData", JSON.stringify(driverData));
          localStorage.setItem(
            "driverShipments",
            JSON.stringify(shipmentsData)
          );
        }
      } catch (err) {
        console.error("[FETCH DRIVER]", err.response?.data || err.message);
        logout(); // Auto logout if token invalid
      }
    },
    [token]
  );

  // ====================================================
  // AUTO LOGIN / FETCH DRIVER ON LOAD
  // ====================================================
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("driverToken");
      const storedDriver = localStorage.getItem("driverData");
      const storedShipments = localStorage.getItem("driverShipments");
      const storedRole = localStorage.getItem("driverRole");

      if (storedToken && storedDriver) {
        setToken(storedToken);
        setDriver(JSON.parse(storedDriver));
        setShipments(storedShipments ? JSON.parse(storedShipments) : []);
        setRole(storedRole || "driver");

        // fetch fresh data from server
        await fetchDriver(storedToken);
      }

      setLoading(false);
    };

    initAuth();
  }, [fetchDriver]);

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
        const { token, driver, shipments: shipmentsData } = res.data;

        setToken(token);
        setDriver(driver);
        setShipments(shipmentsData || []);
        setRole("driver");

        localStorage.setItem("driverToken", token);
        localStorage.setItem("driverData", JSON.stringify(driver));
        localStorage.setItem(
          "driverShipments",
          JSON.stringify(shipmentsData || [])
        );
        localStorage.setItem("driverRole", "driver");

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
        { headers: { Authorization: `Bearer ${token}` } }
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
    setShipments([]);
    setToken("");
    setRole(null);
    localStorage.removeItem("driverToken");
    localStorage.removeItem("driverData");
    localStorage.removeItem("driverShipments");
    localStorage.removeItem("driverRole");
    navigate("/driver/login", { replace: true });
  };

  return (
    <DriverAuthContext.Provider
      value={{
        driver,
        shipments,
        token,
        role,
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
