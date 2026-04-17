import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import CryptoJS from "crypto-js";
import { LuMapPin, LuCalendar, LuChevronRight } from "react-icons/lu";

/**
 * ============================================================
 * MODERN INVITE SHIPMENT PAGE WITH VALIDATION
 * Professional UI with URL validation and token verification
 * ============================================================
 */

const InviteShipmentPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [directions, setDirections] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  /**
   * ================= VALIDATE TOKEN FORMAT =================
   */
  const isValidTokenFormat = (token) => {
    if (!token) return false;
    // Token should be a string of 40 characters (SHA1 hash)
    return /^[a-f0-9]{40}$/i.test(token);
  };

  /**
   * ================= VALIDATE ENCRYPTED EMAIL =================
   */
  const isValidEncryptedEmail = (email) => {
    if (!email) return false;
    try {
      // Check format: should contain colon and hex characters
      return (
        email.includes(":") && /^[a-f0-9:]+$/i.test(email.replace(/%/g, ""))
      );
    } catch (err) {
      return false;
    }
  };

  /**
   * ================= TRUNCATE TEXT =================
   */
  const truncateText = (text, max = 40) =>
    text?.length > max ? text.slice(0, max) + "..." : text;

  /**
   * ================= DECRYPT EMAIL WITH VALIDATION =================
   */
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const encryptedEmail = params.get("e");

      // Validate encrypted email format
      if (!encryptedEmail) {
        console.warn("No encrypted email in URL");
        setRecipientEmail("");
        return;
      }

      if (!isValidEncryptedEmail(encryptedEmail)) {
        console.error("Invalid encrypted email format");
        setRecipientEmail("");
        return;
      }

      // Try to decrypt
      const bytes = CryptoJS.AES.decrypt(
        decodeURIComponent(encryptedEmail),
        process.env.REACT_APP_EMAIL_KEY || "default-key"
      );
      const email = bytes.toString(CryptoJS.enc.Utf8);

      // Validate decrypted email is valid format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && emailRegex.test(email)) {
        setRecipientEmail(email);
      } else {
        console.error("Decrypted email is invalid format:", email);
        setRecipientEmail("");
      }
    } catch (err) {
      console.error("Email decryption error:", err);
      setRecipientEmail("");
    }
  }, []);

  /**
   * ================= FETCH SHIPMENT WITH VALIDATION =================
   */
  useEffect(() => {
    // Validate token format first
    if (!token || !isValidTokenFormat(token)) {
      setError(
        "Invalid invitation link format. Please check the URL and try again."
      );
      setLoading(false);
      setTokenValid(false);
      return;
    }

    setTokenValid(true);

    const fetchShipment = async () => {
      try {
        // Validate token on server
        const res = await axios.get(
          `${
            process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api"
          }/customer/shipment/invite/${token}`,
          {
            timeout: 10000, // 10 second timeout
          }
        );

        if (!res.data || !res.data.shipment) {
          setError("Invalid shipment data received. Please try again.");
          setLoading(false);
          return;
        }

        setShipment(res.data.shipment);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);

        // Handle different error types
        if (err.response?.status === 404) {
          setError("Shipment not found. This invitation may have expired.");
        } else if (err.response?.status === 401) {
          setError(
            "This invitation has expired. Please request a new invitation."
          );
        } else if (err.response?.status === 400) {
          setError(
            err.response?.data?.message ||
              "Invalid invitation link. Please check the URL."
          );
        } else if (err.code === "ECONNABORTED") {
          setError("Request timeout. Please check your connection and retry.");
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to load shipment. Please try again or contact support."
          );
        }

        setLoading(false);
      }
    };

    fetchShipment();
  }, [token]);

  /**
   * ================= FETCH DIRECTIONS =================
   */
  const fetchDirections = useCallback(() => {
    if (
      !window.google ||
      !shipment?.pickupCoords ||
      !shipment?.deliveryCoords
    ) {
      return;
    }

    try {
      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: {
            lat: shipment.pickupCoords.latitude,
            lng: shipment.pickupCoords.longitude,
          },
          destination: {
            lat: shipment.deliveryCoords.latitude,
            lng: shipment.deliveryCoords.longitude,
          },
          travelMode: "DRIVING",
        },
        (result, status) => {
          if (status === "OK") {
            setDirections(result);
          } else {
            console.warn("Directions API error:", status);
          }
        }
      );
    } catch (err) {
      console.error("Error fetching directions:", err);
    }
  }, [shipment]);

  useEffect(() => {
    fetchDirections();
  }, [fetchDirections]);

  /**
   * ================= HANDLE CONFIRM =================
   */
  const handleConfirm = () => {
    if (!tokenValid || !shipment) {
      setError("Invalid shipment data. Please refresh the page.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      navigate("/signup");
    }, 500);
  };

  /**
   * ================= FORMAT DATE =================
   */
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (err) {
      return "Invalid date";
    }
  };

  /**
   * ================= GET STATUS BADGE =================
   */
  const getStatusBadge = (status) => {
    const statusMap = {
      open_for_offers: { color: "bg-blue-100 text-blue-700", label: "Open" },
      assigned: { color: "bg-purple-100 text-purple-700", label: "Assigned" },
      in_transit: {
        color: "bg-orange-100 text-orange-700",
        label: "In Transit",
      },
      delivered: { color: "bg-green-100 text-green-700", label: "Delivered" },
      cancelled: { color: "bg-red-100 text-red-700", label: "Cancelled" },
    };
    return (
      statusMap[status] || { color: "bg-gray-100 text-gray-700", label: status }
    );
  };

  /**
   * ================= INVALID URL STATE =================
   */
  if (!tokenValid && !loading) {
    return (
      <div className="flex font-montserrat items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-red-200">
          <div className="text-6xl mb-6"></div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Invalid Link Format
          </h2>
          <p className="text-gray-600 text-lg mb-6 leading-relaxed">
            The invitation link is not in the correct format. Please check that
            you copied the entire URL correctly.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700 font-mono break-all">
              Token: {token || "Missing"}
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl font-bold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            Go Back Home
          </button>

          <p className="text-sm text-gray-500 mt-6">
            Need help? Contact{" "}
            <a
              href="mailto:support@horseship.com"
              className="text-[#BF9B53] font-semibold"
            >
              support@horseship.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  /**
   * ================= LOADING STATE =================
   */
  if (loading) {
    return (
      <div className="flex font-montserrat items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#BF9B53] to-[#9d7d42] flex items-center justify-center">
            <div className="text-4xl animate-bounce">🏇</div>
          </div>
          <p className="text-gray-700 font-semibold text-lg">
            Loading shipment...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Please wait while we verify your invitation
          </p>
        </div>
      </div>
    );
  }

  /**
   * ================= ERROR STATE =================
   */
  if (error) {
    return (
      <div className="flex font-montserrat items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-red-200">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Invalid or Expired
          </h2>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">{error}</p>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/signup")}
              className="w-full px-6 py-4 bg-gradient-to-r from-[#BF9B53] to-[#9d7d42] text-white rounded-2xl font-bold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Create Account Now
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-full px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all duration-300"
            >
              Go Back Home
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Contact{" "}
            <a
              href="mailto:support@horseship.com"
              className="text-[#BF9B53] font-semibold"
            >
              support
            </a>{" "}
            if you need help
          </p>
        </div>
      </div>
    );
  }

  /**
   * ================= NO SHIPMENT STATE =================
   */
  if (!shipment) {
    return (
      <div className="flex font-montserrat items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-yellow-200">
          <div className="text-6xl mb-6"></div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            No Shipment Found
          </h2>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Unable to load the shipment details. The invitation may be invalid
            or expired.
          </p>

          <button
            onClick={() => navigate("/signup")}
            className="w-full px-6 py-4 bg-gradient-to-r from-[#BF9B53] to-[#9d7d42] text-white rounded-2xl font-bold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusBadge(shipment?.status || "");

  /**
   * ================= RENDER =================
   */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-montserrat">
      <div className="max-w-7xl mx-auto">
        {/* ===================== HEADER ===================== */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-gray-900">
                Shipment Invitation
              </h1>
              <p className="text-gray-600 mt-2">
                You've been invited to track a horse shipment
              </p>
            </div>

            {/* Status Badge */}
            <div
              className={`inline-block ${statusInfo.color} px-6 py-3 rounded-2xl font-bold uppercase text-sm tracking-wide`}
            >
              {statusInfo.label}
            </div>
          </div>

          {/* Code Badge */}
          <div className="inline-block bg-gradient-to-r from-[#BF9B53] to-[#9d7d42] text-white px-6 py-2 rounded-full font-bold text-sm">
            {shipment?.shipmentCode}
          </div>
        </div>

        {/* ===================== MAIN GRID ===================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* LEFT COLUMN - DETAILS */}
          <div className="lg:col-span-1 space-y-6">
            {/* ===================== ROUTE CARD ===================== */}
            <div className="bg-white rounded-3xl border-2 border-gray-200 p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <LuMapPin className="text-[#BF9B53]" size={28} />
                Journey
              </h2>

              <div className="space-y-8">
                {/* Pickup */}
                <div>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                    📍 Pickup Location
                  </p>
                  <p
                    className="font-bold text-gray-900 text-sm mb-2"
                    title={shipment?.pickupLocation}
                  >
                    {truncateText(shipment?.pickupLocation, 50)}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 w-fit px-3 py-2 rounded-lg font-semibold">
                    <LuCalendar size={16} />
                    {formatDate(shipment?.pickupDateRange.start)}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="w-1 h-12 bg-gradient-to-b from-gray-300 to-transparent rounded-full" />
                </div>

                {/* Delivery */}
                <div>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                    🎯 Delivery Location
                  </p>
                  <p
                    className="font-bold text-gray-900 text-sm mb-2"
                    title={shipment?.deliveryLocation}
                  >
                    {truncateText(shipment?.deliveryLocation, 50)}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 w-fit px-3 py-2 rounded-lg font-semibold">
                    <LuCalendar size={16} />
                    {formatDate(shipment?.deliveryDateRange.end)}
                  </div>
                </div>
              </div>
            </div>

            {/* ===================== HORSES CARD ===================== */}
            <div className="bg-white rounded-3xl border-2 border-gray-200 p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                Horses
                <span className="ml-auto inline-block bg-[#BF9B53] text-white px-3 py-1 rounded-full text-sm font-bold">
                  {shipment?.numberOfHorses}
                </span>
              </h2>

              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {shipment?.horses && shipment.horses.length > 0 ? (
                  shipment.horses.map((horse, index) => (
                    <div
                      key={index}
                      className="flex gap-4 bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-2xl border border-gray-200 hover:border-[#BF9B53] hover:shadow-md transition-all duration-300 group"
                    >
                      {/* Horse Image */}
                      <div className="flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 border-gray-200 group-hover:border-[#BF9B53] transition-colors shadow-sm">
                        <img
                          src={
                            horse.photo?.url ||
                            "https://via.placeholder.com/100"
                          }
                          alt={horse.registeredName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/100?text=Horse";
                          }}
                        />
                      </div>

                      {/* Horse Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base mb-1">
                          {horse.registeredName}
                        </h3>
                        <p className="text-sm text-gray-600 font-semibold mb-2">
                          <span className="text-gray-500">Barn:</span>{" "}
                          {horse.barnName}
                        </p>
                        <div className="flex gap-2 flex-wrap mb-2">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-bold">
                            {horse.breed}
                          </span>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-lg font-bold">
                            {horse.sex}
                          </span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg font-bold">
                            {horse.age}y
                          </span>
                        </div>
                        {horse.generalInfo && (
                          <p className="text-xs text-gray-600 italic line-clamp-2">
                            "{horse.generalInfo}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No horses found
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - MAP & INFO */}
          <div className="lg:col-span-2 space-y-6">
            {/* ===================== MAP CARD ===================== */}
            <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-md overflow-hidden h-[500px]">
              {shipment?.pickupCoords && shipment?.deliveryCoords ? (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={{
                    lat: shipment.pickupCoords.latitude,
                    lng: shipment.pickupCoords.longitude,
                  }}
                  zoom={6}
                  options={{
                    styles: [
                      {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }],
                      },
                    ],
                  }}
                >
                  {/* Pickup Marker */}
                  <Marker
                    position={{
                      lat: shipment.pickupCoords.latitude,
                      lng: shipment.pickupCoords.longitude,
                    }}
                    title="Pickup Location"
                    icon={{
                      path: window.google?.maps?.SymbolPath?.CIRCLE,
                      scale: 10,
                      fillColor: "#3B82F6",
                      fillOpacity: 1,
                      strokeColor: "#FFFFFF",
                      strokeWeight: 2,
                    }}
                  />

                  {/* Delivery Marker */}
                  <Marker
                    position={{
                      lat: shipment.deliveryCoords.latitude,
                      lng: shipment.deliveryCoords.longitude,
                    }}
                    title="Delivery Location"
                    icon={{
                      path: window.google?.maps?.SymbolPath?.CIRCLE,
                      scale: 10,
                      fillColor: "#10B981",
                      fillOpacity: 1,
                      strokeColor: "#FFFFFF",
                      strokeWeight: 2,
                    }}
                  />

                  {/* Route */}
                  {directions && <DirectionsRenderer directions={directions} />}
                </GoogleMap>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500 font-semibold">
                    Map not available
                  </p>
                </div>
              )}
            </div>

            {/* ===================== INFO CARDS GRID ===================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Timeline */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 p-6">
                <p className="text-xs font-black text-blue-600 uppercase mb-2">
                  Timeline
                </p>
                <p className="text-2xl font-black text-blue-900">
                  {shipment?.pickupDateRange?.start &&
                  shipment?.deliveryDateRange?.end
                    ? (() => {
                        const start = new Date(shipment.pickupDateRange.start);
                        const end = new Date(shipment.deliveryDateRange.end);

                        const isSameDay =
                          start.toDateString() === end.toDateString();

                        if (isSameDay) {
                          const hours = Math.ceil(
                            (end - start) / (1000 * 60 * 60)
                          );
                          return `${hours} hrs`;
                        } else {
                          const days = Math.ceil(
                            (end - start) / (1000 * 60 * 60 * 24)
                          );
                          return `${days} days`;
                        }
                      })()
                    : "N/A"}
                </p>
                <p className="text-xs text-blue-700 mt-2 font-semibold">
                  From pickup to delivery
                </p>
              </div>

              {/* Distance */}
              {directions && (
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200 p-6">
                  <p className="text-xs font-black text-orange-600 uppercase mb-2">
                    Distance
                  </p>
                  <p className="text-2xl font-black text-orange-900">
                    {(
                      directions.routes[0]?.legs[0]?.distance?.value / 1609.34
                    ).toFixed(0)}{" "}
                    mi
                  </p>
                  <p className="text-xs text-orange-700 mt-2 font-semibold">
                    Approximate driving distance
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===================== CTA SECTION ===================== */}
        <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-xl p-8 sm:p-10 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#BF9B53] to-[#9d7d42] rounded-full mb-6">
              <span className="text-3xl">✨</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
              Ready to Track Your Shipment?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-2">
              Hi{" "}
              <span className="font-bold text-gray-900">
                {recipientEmail || "there"}
              </span>
              ,
            </p>
            <p className="text-gray-600 text-lg">
              Create your account to receive real-time updates and track your
              horse shipment every step of the way.
            </p>
          </div>

          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-[#BF9B53] to-[#9d7d42] text-white rounded-2xl font-black text-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-70 flex items-center justify-center gap-2 mx-auto"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin">⏳</div>
                Redirecting...
              </>
            ) : (
              <>
                Confirm & Create Account
                <LuChevronRight size={24} />
              </>
            )}
          </button>

          <p className="text-sm text-gray-500 mt-6">
            This invitation expires on{" "}
            <span className="font-bold text-gray-700">
              {formatDate(shipment?.inviteTokenExpiry)}
            </span>
          </p>
        </div>

        {/* ===================== FOOTER INFO ===================== */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Code */}
            <div className="text-center sm:text-left">
              <p className="text-xs font-black text-gray-500 uppercase mb-2">
                Shipment Code
              </p>
              <p className="text-gray-900 font-bold">
                {shipment?.shipmentCode}
              </p>
            </div>

            {/* Status */}
            <div className="text-center sm:text-left">
              <p className="text-xs font-black text-gray-500 uppercase mb-2">
                Status
              </p>
              <p className="text-gray-900 font-bold capitalize">
                {shipment?.status?.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteShipmentPage;
