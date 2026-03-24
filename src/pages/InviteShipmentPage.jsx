import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../components/common/Button";
import signupBg from "../assets/images/authPage.jpg";
import Toast from "../components/common/Toast";

const InviteShipmentPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Link invalid or expired. Please sign up to access shipment.");
      setLoading(false);
      return;
    }

    const fetchShipment = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/shipment/invite/${token}`
        );
        console.log("Shipment fetched:", res.data.shipment);
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
      className="min-h-screen flex items-center justify-center bg-cover bg-center font-montserrat p-4"
      style={{ backgroundImage: `url(${signupBg})` }}
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-md w-full max-w-lg">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
          Shipment Invitation
        </h1>

        <table className="w-full border-collapse text-sm">
          <tbody>
            <tr>
              <td className="font-medium py-1">Shipment Code:</td>
              <td>{shipment.shipmentCode || "N/A"}</td>
            </tr>
            <tr>
              <td className="font-medium py-1">Pickup:</td>
              <td>{shipment.pickupLocation}</td>
            </tr>
            <tr>
              <td className="font-medium py-1">Delivery:</td>
              <td>{shipment.deliveryLocation}</td>
            </tr>
            <tr>
              <td className="font-medium py-1">Pickup Date:</td>
              <td>{new Date(shipment.pickupDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td className="font-medium py-1">Delivery Date:</td>
              <td>{new Date(shipment.deliveryDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td className="font-medium py-1">Status:</td>
              <td>{shipment.status}</td>
            </tr>
          </tbody>
        </table>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-600 mb-2">
            Sign up to get full access and manage shipments.
          </p>
          <Button
            onClick={() =>
              navigate(
                `/signup?email=${shipment.recipientEmail}&shipment=${shipment._id}`
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
