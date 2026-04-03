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
  const [vehicle, setVehicle] = useState(
    () => JSON.parse(localStorage.getItem("driverVehicle")) || null
  );
  const [shipment, setCurrentShipment] = useState(
    () => JSON.parse(localStorage.getItem("driverCurrentShipment")) || null
  );
  const [allShipments, setAllShipments] = useState(
    () => JSON.parse(localStorage.getItem("driverShipments")) || []
  );
  const [token, setToken] = useState(
    () => localStorage.getItem("driverToken") || ""
  );
  const [role, setRole] = useState(
    () => localStorage.getItem("driverRole") || "driver"
  );
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // ------------------ LOGOUT ------------------
  const logout = useCallback(() => {
    setDriver(null);
    setVehicle(null);
    setCurrentShipment(null);
    setAllShipments([]);
    setToken("");
    setRole(null);

    localStorage.removeItem("driverToken");
    localStorage.removeItem("driverData");
    localStorage.removeItem("driverVehicle");
    localStorage.removeItem("driverCurrentShipment");
    localStorage.removeItem("driverShipments");
    localStorage.removeItem("driverRole");

    navigate("/driver/login", { replace: true });
  }, [navigate]);

  // ------------------ FETCH DRIVER + SHIPMENTS ------------------
  const fetchDriver = useCallback(
    async (overrideToken) => {
      const authToken = overrideToken || token;
      if (!authToken) return;

      try {
        const res = await axios.get(`${API_BASE_URL}/driver/driver/me`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (res.data.success) {
          const driverData = res.data.driver || null;
          const vehicleData = res.data.vehicle || null;
          const shipmentData = res.data.shipment || null;
          const allShipmentsData = res.data.allShipments || [];

          // update context state
          setDriver(driverData);
          setVehicle(vehicleData);
          setCurrentShipment(shipmentData);
          setAllShipments(allShipmentsData);

          // store in localStorage
          localStorage.setItem("driverData", JSON.stringify(driverData));
          localStorage.setItem("driverVehicle", JSON.stringify(vehicleData));
          localStorage.setItem(
            "driverCurrentShipment",
            JSON.stringify(shipmentData)
          );
          localStorage.setItem(
            "driverShipments",
            JSON.stringify(allShipmentsData)
          );

          return { driverData, vehicleData, shipmentData, allShipmentsData };
        }
      } catch (err) {
        console.error("[FETCH DRIVER]", err.response?.data || err.message);
        logout();
      }
    },
    [token, logout]
  );

  // ------------------ AUTO LOGIN / FETCH DRIVER ON LOAD ------------------
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("driverToken");
      const storedDriver = localStorage.getItem("driverData");
      const storedVehicle = localStorage.getItem("driverVehicle");
      const storedCurrentShipment = localStorage.getItem(
        "driverCurrentShipment"
      );
      const storedAllShipments = localStorage.getItem("driverShipments");
      const storedRole = localStorage.getItem("driverRole");

      if (storedToken && storedDriver) {
        setToken(storedToken);
        setDriver(JSON.parse(storedDriver));
        setVehicle(storedVehicle ? JSON.parse(storedVehicle) : null);
        setCurrentShipment(
          storedCurrentShipment ? JSON.parse(storedCurrentShipment) : null
        );
        setAllShipments(
          storedAllShipments ? JSON.parse(storedAllShipments) : []
        );
        setRole(storedRole || "driver");

        await fetchDriver(storedToken);
      }

      setLoading(false);
    };

    initAuth();
  }, [fetchDriver]);

  // ------------------ DRIVER LOGIN ------------------
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/driver/driver/login`, {
        email,
        password,
      });

      if (res.data.success) {
        const {
          token,
          driver,
          shipments: shipmentsData,
          vehicle,
          shipment,
        } = res.data;

        setToken(token);
        setDriver(driver);
        setVehicle(vehicle || null);
        setCurrentShipment(shipment || null);
        setAllShipments(shipmentsData || []);
        setRole("driver");

        localStorage.setItem("driverToken", token);
        localStorage.setItem("driverData", JSON.stringify(driver));
        localStorage.setItem("driverVehicle", JSON.stringify(vehicle || null));
        localStorage.setItem(
          "driverCurrentShipment",
          JSON.stringify(shipment || null)
        );
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

  // ------------------ UPLOAD / DELETE PROFILE IMAGE ------------------
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

  // ------------------ FETCH ASSIGNED SHIPMENTS ------------------
  const fetchAssignedShipments = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/driver/assigned-shipments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const shipmentsData = res.data.assignedShipments || [];
        setAllShipments(shipmentsData);
        localStorage.setItem("driverShipments", JSON.stringify(shipmentsData));
      } else {
        setAllShipments([]);
        localStorage.removeItem("driverShipments");
      }
    } catch (err) {
      setAllShipments([]);
      localStorage.removeItem("driverShipments");
      console.error(
        "[FETCH ASSIGNED SHIPMENTS]",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  const startTrip = async (quoteId) => {
    if (!token) return;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/driver/start-trip`,
        { quoteId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) await fetchAssignedShipments();
      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message,
      };
    }
  };

  const updateLocation = async (lat, lng) => {
    if (!token) return;

    try {
      await axios.post(
        `${API_BASE_URL}/driver/update-location`,
        { lat, lng },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Location update failed");
    }
  };

  const completeShipment = async (quoteId) => {
    if (!token) return;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/driver/complete-shipment`,
        { quoteId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) await fetchAssignedShipments();
      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message,
      };
    }
  };

  // ------------------ SEND DELIVERY OTP ------------------
  const sendDeliveryOtp = async (shipmentId) => {
    if (!token) return;

    setActionLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/driver/driver/shipment/${shipmentId}/send-delivery-otp`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message,
      };
    } finally {
      setActionLoading(false);
    }
  };

  // ------------------ VERIFY DELIVERY OTP ------------------
  const verifyDeliveryOtp = async (shipmentId, otp) => {
    if (!token) return;

    setActionLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/driver/driver/shipment/${shipmentId}/verify-delivery-otp`,
        { otp },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // refresh shipments after delivery
      if (res.data.success) {
        await fetchAssignedShipments();
      }

      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message,
      };
    } finally {
      setActionLoading(false);
    }
  };
  return (
    <DriverAuthContext.Provider
      value={{
        driver,
        vehicle,
        shipment,
        allShipments,
        token,
        role,
        loading,
        actionLoading,
        login,
        fetchDriver,
        uploadProfileImage,
        deleteProfileImage,
        fetchAssignedShipments,
        logout,
        startTrip,
        updateLocation,
        completeShipment,
        sendDeliveryOtp,
        verifyDeliveryOtp,
      }}
    >
      {children}
    </DriverAuthContext.Provider>
  );
};

export const useDriverAuth = () => useContext(DriverAuthContext);
