import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../components/common/Button";
import Toast from "../components/common/Toast";
import signupBg from "../assets/images/authPage.jpg";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import CryptoJS from "crypto-js";

const InviteShipmentPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
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

  const fetchDirections = useCallback(() => {
    if (!window.google || !shipment) return;

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
        } else console.error("Directions request failed:", status);
      }
    );
  }, [shipment]);

  useEffect(() => {
    fetchDirections();
  }, [fetchDirections]);

  if (loading) return <div className="p-6">Loading shipment details...</div>;

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 font-montserrat bg-gray-50">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <Button onClick={() => navigate(`/signup`)}>
            Sign Up for Full Access
          </Button>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center font-montserrat p-4"
      style={{ backgroundImage: `url(${signupBg})` }}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-md w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Shipment Invitation
        </h1>

        {/* Shipment Info */}
        <div className="mb-6">
          <h2 className="font-semibold text-gray-700 mb-2">Shipment Details</h2>
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr>
                <td className="font-medium py-1">Shipment Code:</td>
                <td>{shipment.shipmentCode || "N/A"}</td>
              </tr>
              <tr>
                <td className="font-medium py-1">Status:</td>
                <td>{shipment.status}</td>
              </tr>
              <tr>
                <td className="font-medium py-1">Pickup Location:</td>
                <td>{shipment.pickupLocation}</td>
              </tr>
              <tr>
                <td className="font-medium py-1">Pickup Date:</td>
                <td>{new Date(shipment.pickupDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td className="font-medium py-1">Delivery Location:</td>
                <td>{shipment.deliveryLocation}</td>
              </tr>
              <tr>
                <td className="font-medium py-1">Delivery Date:</td>
                <td>{new Date(shipment.deliveryDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td className="font-medium py-1">Number of Horses:</td>
                <td>{shipment.numberOfHorses}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Horse Info */}
        <div className="mb-6">
          <h2 className="font-semibold text-gray-700 mb-2">Horse Details</h2>
          {shipment.horses.map((horse, index) => (
            <div
              key={index}
              className="border rounded-lg p-3 mb-3 flex items-start gap-3 bg-gray-50"
            >
              <img
                src={horse.photo.url || "/placeholder-horse.png"}
                alt={horse.registeredName}
                className="w-20 h-20 object-cover rounded"
              />
              <div>
                <p>
                  <strong>Name:</strong> {horse.registeredName} (
                  {horse.barnName})
                </p>
                <p>
                  <strong>Breed:</strong> {horse.breed}{" "}
                  {horse.otherBreed && `(${horse.otherBreed})`}
                </p>
                <p>
                  <strong>Sex:</strong> {horse.sex}, <strong>Age:</strong>{" "}
                  {horse.age}
                </p>
                <p>
                  <strong>Colour:</strong> {horse.colour},{" "}
                  <strong>Stall Size:</strong> {horse.requestedStallSize}
                </p>
                {horse.generalInfo && (
                  <p>
                    <strong>Notes:</strong> {horse.generalInfo}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Google Map */}
        <div className="mb-6">
          <h2 className="font-semibold text-gray-700 mb-2">Shipment Map</h2>
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "300px" }}
            center={{
              lat: shipment.pickupCoords.latitude,
              lng: shipment.pickupCoords.longitude,
            }}
            zoom={6}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          >
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  polylineOptions: {
                    strokeColor: "#BF9B53",
                    strokeWeight: 5,
                    strokeOpacity: 0.8,
                  },
                  suppressMarkers: true,
                }}
              />
            )}

            {/* Pickup Marker */}
            <Marker
              position={{
                lat: shipment.pickupCoords.latitude,
                lng: shipment.pickupCoords.longitude,
              }}
              label={{ text: "Pickup", color: "#fff", fontWeight: "bold" }}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#BF9B53",
                fillOpacity: 1,
                strokeWeight: 1,
                strokeColor: "#000",
              }}
            />

            {/* Delivery Marker */}
            <Marker
              position={{
                lat: shipment.deliveryCoords.latitude,
                lng: shipment.deliveryCoords.longitude,
              }}
              label={{ text: "Delivery", color: "#fff", fontWeight: "bold" }}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#007BFF",
                fillOpacity: 1,
                strokeWeight: 1,
                strokeColor: "#000",
              }}
            />
          </GoogleMap>
        </div>

        {/* Signup CTA */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-600 mb-2">
            Sign up to get full access and manage shipments.
          </p>
          <Button
            onClick={() =>
              navigate(
                `/signup?email=${encodeURIComponent(recipientEmail)}&shipment=${
                  shipment._id
                }`
              )
            }
          >
            Sign Up
          </Button>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default InviteShipmentPage;
