import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DriverAuthContext = createContext();

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

export const DriverAuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // ============================================================
  // STATE INITIALIZATION
  // ============================================================
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
  const [locationPermission, setLocationPermission] = useState(
    () => localStorage.getItem("locationPermission") || "unknown"
  );
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(
    () => localStorage.getItem("driverTrackingEnabled") === "true"
  );

  // Refs for stable callback references
  const tokenRef = useRef(token);
  const trackingIntervalRef = useRef(null);
  const isSyncingLocationRef = useRef(false);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    localStorage.setItem("driverTrackingEnabled", String(isTrackingEnabled));
  }, [isTrackingEnabled]);

  // ============================================================
  // LOCATION PERMISSION CHECK
  // ============================================================
  const checkLocationPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationPermission("denied");
      return false;
    }

    try {
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          () => {
            setLocationPermission("granted");
            localStorage.setItem("locationPermission", "granted");
            resolve(true);
          },
          (err) => {
            if (err.code === err.PERMISSION_DENIED) {
              setLocationPermission("denied");
              localStorage.setItem("locationPermission", "denied");
            }
            reject(err);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      });
      return true;
    } catch (err) {
      console.error("Location permission error:", err);
      return false;
    }
  }, []);

  // ============================================================
  // UPDATE DRIVER LOCATION
  // ============================================================
  const updateDriverLocation = useCallback(
    async ({ latitude, longitude, speed = 0, heading = 0 }) => {
      const authToken = tokenRef.current;
      if (!authToken) return null;

      try {
        const res = await axios.post(
          `${API_BASE_URL}/shipper/driver/update-location`,
          { lat: latitude, lng: longitude, speed, heading },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        return res.data;
      } catch (err) {
        console.error("Location update failed:", err);
        throw err?.response?.data || err;
      }
    },
    []
  );

  // ============================================================
  // GET CURRENT POSITION
  // ============================================================
  const getCurrentDriverPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            speed: pos.coords.speed || 0,
            heading: pos.coords.heading || 0,
          }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  // ============================================================
  // TRACKING MANAGEMENT
  // ============================================================
  const stopTrackingLoop = useCallback(() => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
  }, []);

  const syncDriverLocationOnce = useCallback(
    async (positionOverride = null) => {
      if (isSyncingLocationRef.current) return null;

      isSyncingLocationRef.current = true;

      try {
        const currentPosition =
          positionOverride || (await getCurrentDriverPosition());
        const res = await updateDriverLocation(currentPosition);

        if (res?.tripActive === false) {
          stopTrackingLoop();
          setIsTrackingEnabled(false);
        }

        return res;
      } finally {
        isSyncingLocationRef.current = false;
      }
    },
    [getCurrentDriverPosition, stopTrackingLoop, updateDriverLocation]
  );

  const startTrackingLoop = useCallback(() => {
    stopTrackingLoop();

    trackingIntervalRef.current = setInterval(async () => {
      try {
        await syncDriverLocationOnce();
      } catch (err) {
        console.error("Failed to update location:", err);
      }
    }, 5000);
  }, [stopTrackingLoop, syncDriverLocationOnce]);

  // Auto start/stop tracking based on state
  useEffect(() => {
    if (!isTrackingEnabled || !token || locationPermission !== "granted") {
      stopTrackingLoop();
      return;
    }

    startTrackingLoop();

    return () => {
      stopTrackingLoop();
    };
  }, [
    isTrackingEnabled,
    token,
    locationPermission,
    startTrackingLoop,
    stopTrackingLoop,
  ]);

  // ============================================================
  // LOGOUT
  // ============================================================
  const logout = useCallback(() => {
    setDriver(null);
    setVehicle(null);
    setCurrentShipment(null);
    setAllShipments([]);
    setToken("");
    setRole(null);
    setIsTrackingEnabled(false);
    stopTrackingLoop();

    localStorage.removeItem("driverToken");
    localStorage.removeItem("driverData");
    localStorage.removeItem("driverVehicle");
    localStorage.removeItem("driverCurrentShipment");
    localStorage.removeItem("driverShipments");
    localStorage.removeItem("driverRole");
    localStorage.removeItem("driverTrackingEnabled");

    navigate("/driver/login", { replace: true });
  }, [navigate, stopTrackingLoop]);

  // ============================================================
  // FETCH DRIVER DATA
  // ============================================================
  const fetchDriver = useCallback(
    async (overrideToken) => {
      const authToken = overrideToken || tokenRef.current;
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

          setDriver(driverData);
          setVehicle(vehicleData);
          setCurrentShipment(shipmentData);
          setAllShipments(allShipmentsData);

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
    [logout]
  );

  // ============================================================
  // AUTO LOGIN
  // ============================================================
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("driverToken");
      const storedDriver = localStorage.getItem("driverData");

      if (storedToken && storedDriver) {
        setToken(storedToken);
        tokenRef.current = storedToken;
        setDriver(JSON.parse(storedDriver));
        setVehicle(
          localStorage.getItem("driverVehicle")
            ? JSON.parse(localStorage.getItem("driverVehicle"))
            : null
        );
        setCurrentShipment(
          localStorage.getItem("driverCurrentShipment")
            ? JSON.parse(localStorage.getItem("driverCurrentShipment"))
            : null
        );
        setAllShipments(
          localStorage.getItem("driverShipments")
            ? JSON.parse(localStorage.getItem("driverShipments"))
            : []
        );
        setRole(localStorage.getItem("driverRole") || "driver");
        setLocationPermission(
          localStorage.getItem("locationPermission") || "unknown"
        );

        await fetchDriver(storedToken);
      }

      setLoading(false);
    };

    initAuth();
  }, [fetchDriver]);

  // ============================================================
  // LOGIN
  // ============================================================
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/driver/driver/login`, {
        email,
        password,
      });

      if (res.data.success) {
        const {
          token: newToken,
          driver: driverData,
          shipments: shipmentsData,
          vehicle: vehicleData,
          shipment: shipmentData,
        } = res.data;

        tokenRef.current = newToken;
        setToken(newToken);
        setDriver(driverData);
        setVehicle(vehicleData || null);
        setCurrentShipment(shipmentData || null);
        setAllShipments(shipmentsData || []);
        setRole("driver");

        localStorage.setItem("driverToken", newToken);
        localStorage.setItem("driverData", JSON.stringify(driverData));
        localStorage.setItem(
          "driverVehicle",
          JSON.stringify(vehicleData || null)
        );
        localStorage.setItem(
          "driverCurrentShipment",
          JSON.stringify(shipmentData || null)
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

  // ============================================================
  // PROFILE IMAGE
  // ============================================================
  const uploadProfileImage = async (file) => {
    if (!file || !tokenRef.current) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/driver/driver/profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`,
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
    if (!tokenRef.current) return;
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/driver/driver/profile-image`,
        { headers: { Authorization: `Bearer ${tokenRef.current}` } }
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

  // ============================================================
  // FETCH ASSIGNED SHIPMENTS
  // ============================================================
  const fetchAssignedShipments = useCallback(async () => {
    if (!tokenRef.current) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/driver/driver/assigned-shipments`,
        {
          headers: { Authorization: `Bearer ${tokenRef.current}` },
        }
      );
      if (res.data.success) {
        const shipmentsData = res.data.shipments || res.data.assignedShipments || [];
        setAllShipments(shipmentsData);
        localStorage.setItem("driverShipments", JSON.stringify(shipmentsData));
        return shipmentsData;
      } else {
        setAllShipments([]);
      }
    } catch (err) {
      console.error(
        "[FETCH ASSIGNED SHIPMENTS]",
        err.response?.data || err.message
      );
      setAllShipments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // START TRIP
  // ============================================================
  const startTrip = useCallback(
    async (quoteId, currentLocation = null) => {
      if (!tokenRef.current)
        return { success: false, message: "Not authenticated" };

      try {
        const res = await axios.post(
          `${API_BASE_URL}/shipper/driver/start-trip`,
          { quoteId },
          { headers: { Authorization: `Bearer ${tokenRef.current}` } }
        );

        if (res.data.success) {
          const locationRes = await syncDriverLocationOnce(
            currentLocation
              ? {
                  latitude: currentLocation.lat,
                  longitude: currentLocation.lng,
                  speed: currentLocation.speed || 0,
                  heading: currentLocation.heading || 0,
                }
              : null
          );

          if (locationRes?.success) {
            setIsTrackingEnabled(true);
            startTrackingLoop();
          }

          await fetchDriver();
        }

        return res.data;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || err.message,
        };
      }
    },
    [syncDriverLocationOnce, fetchDriver, startTrackingLoop]
  );

  // ============================================================
  // COMPLETE SHIPMENT
  // ============================================================
  const completeShipment = useCallback(
    async (quoteId) => {
      if (!tokenRef.current) return;
      try {
        const res = await axios.post(
          `${API_BASE_URL}/driver/driver/complete-shipment`,
          { quoteId },
          { headers: { Authorization: `Bearer ${tokenRef.current}` } }
        );
        if (res.data.success) {
          setIsTrackingEnabled(false);
          stopTrackingLoop();
          await fetchAssignedShipments();
        }
        return res.data;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || err.message,
        };
      }
    },
    [fetchAssignedShipments, stopTrackingLoop]
  );

  // ============================================================
  // MARK DELIVERED
  // ============================================================
  const markDelivered = useCallback(
    async (quoteId) => {
      if (!tokenRef.current) return;
      try {
        const res = await axios.post(
          `${API_BASE_URL}/driver/driver/complete-shipment`,
          { quoteId },
          { headers: { Authorization: `Bearer ${tokenRef.current}` } }
        );
        if (res.data.success) {
          setIsTrackingEnabled(false);
          stopTrackingLoop();
          await fetchAssignedShipments();
          await fetchDriver();
        }
        return res.data;
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || err.message,
        };
      }
    },
    [fetchAssignedShipments, fetchDriver, stopTrackingLoop]
  );

  // ============================================================
  // SEND DELIVERY OTP
  // ============================================================
  const sendDeliveryOtp = useCallback(async (shipmentId) => {
    if (!tokenRef.current) return;
    setActionLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/driver/driver/shipment/${shipmentId}/send-delivery-otp`,
        {},
        { headers: { Authorization: `Bearer ${tokenRef.current}` } }
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
  }, []);

  // ============================================================
  // VERIFY DELIVERY OTP
  // ============================================================
  const verifyDeliveryOtp = useCallback(
    async (shipmentId, otp) => {
      if (!tokenRef.current) return;
      setActionLoading(true);
      try {
        const res = await axios.post(
          `${API_BASE_URL}/driver/driver/shipment/${shipmentId}/verify-delivery-otp`,
          { otp },
          { headers: { Authorization: `Bearer ${tokenRef.current}` } }
        );
        if (res.data.success) {
          setIsTrackingEnabled(false);
          stopTrackingLoop();
          await fetchAssignedShipments();
          await fetchDriver();
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
    },
    [fetchAssignedShipments, fetchDriver, stopTrackingLoop]
  );

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
        locationPermission,
        isTrackingEnabled,
        login,
        fetchDriver,
        uploadProfileImage,
        deleteProfileImage,
        fetchAssignedShipments,
        logout,
        startTrip,
        completeShipment,
        markDelivered,
        sendDeliveryOtp,
        verifyDeliveryOtp,
        updateDriverLocation,
        checkLocationPermission,
        setIsTrackingEnabled,
      }}
    >
      {children}
    </DriverAuthContext.Provider>
  );
};

export const useDriverAuth = () => useContext(DriverAuthContext);
