import React, { useEffect, useState } from "react";
import { useShipperQuote } from "../../contexts/shipperContext/ShipperQuoteContext";
import { useShipperDelivery } from "../../contexts/shipperContext/ShipperDeliveryContext";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";

const AllUpcomingShipments = () => {
  const { quotes, loading } = useShipperQuote();
  const {
    markDelivered,
    verifyOtp,
    loading: deliveryLoading,
  } = useShipperDelivery();
  const navigate = useNavigate();

  const [acceptedQuotes, setAcceptedQuotes] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  // Filter accepted quotes
  useEffect(() => {
    setAcceptedQuotes(quotes.filter((q) => q.status === "accepted"));
  }, [quotes]);

  // Click handler for marking delivered
  const handleMarkDelivered = async (shipment) => {
    try {
      setSelectedShipment(shipment);
      await markDelivered(shipment._id);
      setOtpModalOpen(true); // open OTP modal
    } catch (err) {
      console.error(err);
      setOtpError("Failed to mark delivered. Please try again.");
    }
  };

  // OTP verification
  const handleVerifyOtp = async () => {
    if (!otp) return setOtpError("Please enter OTP");

    try {
      setOtpError(""); // clear previous errors
      await verifyOtp(selectedShipment._id, otp);
      setOtpModalOpen(false);
      setOtp("");
      navigate("/shipper/settings?tab=payment");
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "OTP verification failed. Please try again.";
      setOtpError(message);
    }
  };

  if (loading) return <div>Loading shipments...</div>;

  return (
    <div className="font-montserrat">
      <h1 className="text-2xl font-semibold mb-4">All Accepted Shipments</h1>

      {acceptedQuotes.length === 0 ? (
        <p>No accepted shipments found</p>
      ) : (
        <div className="flex flex-col gap-4">
          {acceptedQuotes.map((quote) => (
            <div
              key={quote._id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition"
            >
              <h2 className="font-semibold">
                {quote.shipment.pickupLocation} →{" "}
                {quote.shipment.deliveryLocation}
              </h2>
              <p>
                Pickup Date:{" "}
                {new Date(quote.shipment.pickupDate).toLocaleDateString()}
              </p>
              <p>Status: {quote.status}</p>

              <button
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                disabled={
                  deliveryLoading &&
                  selectedShipment?._id === quote.shipment._id
                }
                onClick={() => handleMarkDelivered(quote.shipment)}
              >
                {deliveryLoading && selectedShipment?._id === quote.shipment._id
                  ? "Processing..."
                  : "Mark Delivered"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* OTP Modal */}
      {otpModalOpen && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">
              Enter OTP for shipment to {selectedShipment.deliveryLocation}
            </h2>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full border p-2 rounded mb-2"
            />

            {/* Show OTP error */}
            {otpError && (
              <p className="text-red-500 text-sm mb-2">{otpError}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setOtpModalOpen(false);
                  setOtp("");
                  setOtpError("");
                }}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <Button
                onClick={handleVerifyOtp}
                variant="primary"
                type="submit"
                fullWidth
              >
                {deliveryLoading ? "Verifying..." : "Verify OTP"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUpcomingShipments;
