import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../components/common/Button";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import CryptoJS from "crypto-js";

const InviteShipmentPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [directions, setDirections] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState("");

  // Decrypt email from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encryptedEmail = params.get("e");
    if (encryptedEmail) {
      try {
        const bytes = CryptoJS.AES.decrypt(
          decodeURIComponent(encryptedEmail),
          process.env.REACT_APP_EMAIL_KEY
        );
        const email = bytes.toString(CryptoJS.enc.Utf8);
        setRecipientEmail(email);
      } catch (err) {
        console.error("Failed to decrypt email:", err);
      }
    }
  }, []);

  // Fetch shipment details
  useEffect(() => {
    if (!token) {
      setError("Link invalid or expired. Please sign up to access shipment.");
      setLoading(false);
      return;
    }

    const fetchShipment = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/customer/shipment/invite/${token}`
        );
        setShipment(res.data.shipment);
      } catch (err) {
        console.error("Invite fetch error:", err);
        const backendMessage =
          err.response?.data?.message ||
          "Link invalid or expired. Please sign up to access shipment.";
        setError(backendMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchShipment();
  }, [token]);

  // Fetch directions
  const fetchDirections = useCallback(() => {
    if (!window.google || !shipment) return;
    if (!shipment.pickupCoords || !shipment.deliveryCoords) return;

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
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error("Directions request failed:", status);
        }
      }
    );
  }, [shipment]);

  useEffect(() => {
    fetchDirections();
  }, [fetchDirections]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">
            Loading shipment details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-red-50 rounded-2xl p-8 max-w-lg text-center border border-red-200 shadow">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button
            onClick={() => navigate("/signup")}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl shadow hover:scale-105 transition"
          >
            Sign Up
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#BF9B53]/10 py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Shipment Invitation
          </h1>
          <p className="text-gray-600 mt-1">
            Tracking Code:{" "}
            <span className="font-semibold">{shipment.shipmentCode}</span>
          </p>
        </div>
        <div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-bold ${
              shipment.status === "confirmed"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {shipment.status.toUpperCase()}
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Shipment + Horses */}
        <div className="space-y-6">
          {/* Shipment Info */}
          <section className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h2 className="text-xl font-bold mb-4">Journey Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <h3 className="font-semibold">Pickup</h3>
                <p className="text-gray-700">{shipment.pickupLocation}</p>
                <p className="text-sm text-gray-500">
                  {new Date(shipment.pickupDate).toLocaleDateString()}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <h3 className="font-semibold">Delivery</h3>
                <p className="text-gray-700">{shipment.deliveryLocation}</p>
                <p className="text-sm text-gray-500">
                  {new Date(shipment.deliveryDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </section>

          {/* Horses */}
          <section className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h2 className="text-xl font-bold mb-4">
              Horses ({shipment.numberOfHorses})
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {shipment.horses.map((horse, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <div className="w-24 h-28 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                    <img
                      src={
                        horse.photo?.url || "https://via.placeholder.com/96x112"
                      }
                      alt={horse.registeredName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">
                      {horse.registeredName}
                    </h3>
                    <p className="text-gray-600">"{horse.barnName}"</p>
                    <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                      <div>
                        <span className="font-medium text-gray-500">
                          Breed:
                        </span>{" "}
                        {horse.breed}
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Sex:</span>{" "}
                        {horse.sex}
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Age:</span>{" "}
                        {horse.age}
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">
                          Stall:
                        </span>{" "}
                        {horse.requestedStallSize}
                      </div>
                    </div>
                    {horse.generalInfo && (
                      <p className="text-gray-700 mt-2 text-sm line-clamp-3">
                        {horse.generalInfo}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Map + CTA */}
        <div className="space-y-6 sticky top-20">
          <section className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition h-[500px]">
            {shipment.pickupCoords && shipment.deliveryCoords ? (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={{
                  lat: shipment.pickupCoords.latitude,
                  lng: shipment.pickupCoords.longitude,
                }}
                zoom={7}
              >
                <Marker
                  position={{
                    lat: shipment.pickupCoords.latitude,
                    lng: shipment.pickupCoords.longitude,
                  }}
                />
                <Marker
                  position={{
                    lat: shipment.deliveryCoords.latitude,
                    lng: shipment.deliveryCoords.longitude,
                  }}
                />
                {directions && <DirectionsRenderer directions={directions} />}
              </GoogleMap>
            ) : (
              <p className="text-gray-500 text-center mt-20">
                Map not available
              </p>
            )}
          </section>

          {/* Call-to-Action */}
          <div className="p-6  bg-gray-700 text-white font-bold text-center rounded-2xl shadow hover:shadow-lg cursor-pointer">
            <p>
              Hi {recipientEmail || ""}, confirm your participation in this
              shipment.
            </p>
            <Button
              onClick={() => navigate("/signup")}
              className="mt-4 w-full bg-white text-[#8B7D4A] font-semibold rounded-xl shadow hover:scale-105 transition hover:text-white"
            >
              Confirm Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteShipmentPage;
