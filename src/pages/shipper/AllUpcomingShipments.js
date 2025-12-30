import React, { useEffect, useState } from "react";
import { useShipperQuote } from "../../contexts/shipperContext/ShipperQuoteContext";

const AllUpcomingShipments = () => {
  const { quotes, loading, getMyQuotes } = useShipperQuote();
  const [acceptedQuotes, setAcceptedQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null); // store selected quote for details

  // Fetch quotes on component mount
  useEffect(() => {
    getMyQuotes();
  }, []);

  // Filter accepted quotes whenever quotes change
  useEffect(() => {
    const accepted = quotes.filter((q) => q.status === "accepted");
    setAcceptedQuotes(accepted);
  }, [quotes]);

  if (loading) {
    return (
      <div className="text-gray-600 font-[Montserrat] text-lg">
        Loading shipments...
      </div>
    );
  }

  return (
    <div className="font-[Montserrat] p-4">
      <h1 className="text-2xl font-semibold mb-4">All Accepted Shipments</h1>

      {acceptedQuotes.length === 0 ? (
        <p className="text-gray-500">No accepted shipments found</p>
      ) : (
        <div className="flex flex-col gap-4">
          {acceptedQuotes.map((quote) => (
            <div
              key={quote._id}
              className="border rounded-lg p-4 shadow hover:shadow-lg cursor-pointer transition"
              onClick={() =>
                setSelectedQuote(
                  selectedQuote?._id === quote._id ? null : quote
                )
              }
            >
              {/* Basic shipment info */}
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="font-semibold text-lg">
                    {quote.shipment.pickupLocation} →{" "}
                    {quote.shipment.deliveryLocation}
                  </h2>
                  <p className="text-gray-500">
                    Pickup Date:{" "}
                    {new Date(quote.shipment.pickupDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-green-600 font-semibold">
                  {quote.status}
                </div>
              </div>

              {/* Show details if selected */}
              {selectedQuote?._id === quote._id && (
                <div className="mt-4 border-t pt-4 space-y-2">
                  <p>
                    <strong>Delivery Date:</strong>{" "}
                    {new Date(quote.shipment.deliveryDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Number of Horses:</strong>{" "}
                    {quote.shipment.numberOfHorses}
                  </p>
                  <p>
                    <strong>Total Price:</strong> {quote.totalPrice}{" "}
                    {quote.currency}
                  </p>
                  <p>
                    <strong>Payment Method:</strong> {quote.paymentMethod}
                  </p>
                  <p>
                    <strong>Transport Type:</strong> {quote.transportType}
                  </p>
                  <p>
                    <strong>Stalls Required:</strong> {quote.stallsRequired}
                  </p>
                  <p>
                    <strong>Notes:</strong> {quote.notes}
                  </p>

                  {/* Vehicle info */}
                  {quote.vehicle && (
                    <div className="mt-2">
                      <h3 className="font-semibold">Vehicle Info:</h3>
                      <p>Vehicle Number: {quote.vehicle.vehicleNumber}</p>
                      <p>Transport Type: {quote.vehicle.transportType}</p>
                      <p>Vehicle Type: {quote.vehicle.vehicleType}</p>
                      <p>Trailer Type: {quote.vehicle.trailerType}</p>
                      <p>Number of Stalls: {quote.vehicle.numberOfStalls}</p>
                      <p>Stall Size: {quote.vehicle.stallSize}</p>
                      <p>Notes: {quote.vehicle.notes}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {quote.vehicle.images.map((img) => (
                          <img
                            key={img._id}
                            src={img.url}
                            alt="vehicle"
                            className="w-24 h-24 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contract and signatures */}
                  {quote.contract && (
                    <p className="mt-2">
                      <strong>Contract:</strong>{" "}
                      <a
                        href={quote.contract.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View Contract
                      </a>
                    </p>
                  )}
                  {quote.shipperSignature && (
                    <div className="mt-2">
                      <strong>Shipper Signature:</strong>
                      <img
                        src={quote.shipperSignature}
                        alt="Shipper Signature"
                        className="w-32 h-16 object-contain border mt-1"
                      />
                    </div>
                  )}
                  {quote.customerSignature && (
                    <div className="mt-2">
                      <strong>Customer Signature:</strong>
                      <img
                        src={quote.customerSignature}
                        alt="Customer Signature"
                        className="w-32 h-16 object-contain border mt-1"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllUpcomingShipments;
