import React, { useEffect, useState } from "react";
import { useShipperQuote } from "../../contexts/shipperContext/ShipperQuoteContext";
import { useShipperDelivery } from "../../contexts/shipperContext/ShipperDeliveryContext";
import { useNavigate } from "react-router-dom";

const AllUpcomingShipments = () => {
  const { quotes, loading } = useShipperQuote();
  const {
    markDelivered,
    verifyOtp,
    loading: deliveryLoading,
  } = useShipperDelivery();
  const navigate = useNavigate();

  const [acceptedQuotes, setAcceptedQuotes] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null); // shipment clicked
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");

  // Filter accepted quotes
  useEffect(() => {
    setAcceptedQuotes(quotes.filter((q) => q.status === "accepted"));
  }, [quotes]);

  // Click handler for a shipment
  const handleMarkDelivered = async (shipment) => {
    try {
      setSelectedShipment(shipment); // set the clicked shipment
      await markDelivered(shipment._id); // call API only for this shipment
      setOtpModalOpen(true); // open OTP modal
    } catch (err) {
      console.error(err);
      alert("Failed to mark delivered. Try again.");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return alert("Please enter OTP");
    try {
      await verifyOtp(selectedShipment._id, otp);
      setOtpModalOpen(false);
      navigate("/shipper/settings?tab=payment");
    } catch (err) {
      console.error(err);
      alert("OTP verification failed. Please try again.");
    }
  };

  if (loading) return <div>Loading shipments...</div>;

  return (
    <div className="p-4">
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
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">
              Enter OTP for shipment to {selectedShipment.deliveryLocation}
            </h2>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full border p-2 rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOtpModalOpen(false)}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Verify OTP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUpcomingShipments;
