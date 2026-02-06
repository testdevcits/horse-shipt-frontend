import React, { useEffect, useState } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { useShipperQuote } from "../../contexts/shipperContext/ShipperQuoteContext";
import Toast from "../../components/common/Toast";
import PageLoader from "../../components/common/PageLoader";

const ShipperQuotesPage = () => {
  const { quotes, loading, getMyQuotes } = useShipperQuote();
  const [visibleContractId, setVisibleContractId] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const [searchTerm, setSearchTerm] = useState("");

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // Fetch quotes once on mount
  useEffect(() => {
    const fetchQuotes = async () => {
      const data = await getMyQuotes();
      if (!data || data.length === 0) {
        setToast({ message: "No quotes found", type: "info", visible: true });
        setTimeout(
          () => setToast({ message: "", type: "", visible: false }),
          3000
        );
      }
    };
    fetchQuotes();
  }, [getMyQuotes]);

  if (loading) {
    return <PageLoader text="" fullScreen={true} />;
  }

  // Filter quotes by last 6 digits of Shipment ID
  const filteredQuotes = quotes.filter((quote) => {
    const shipmentCode = quote.shipment?.shipmentCode || "";
    const lastSix = shipmentCode.slice(-6).toLowerCase();
    return lastSix.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 uppercase mb-4 md:mb-0">
          My Quotes
        </h1>

        {/* Search Box */}
        <div className="">
          <input
            type="text"
            placeholder="Search by last 6 digits of Shipment ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 px-4 py-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-[#997C42]"
          />
        </div>
      </div>

      {filteredQuotes.length === 0 && !loading && (
        <p className="text-gray-500">No quotes match your search.</p>
      )}

      <div className="space-y-6">
        {filteredQuotes.map((quote) => (
          <div
            key={quote._id}
            className="border rounded-lg bg-white shadow p-6 space-y-4"
          >
            {/* Shipment Info */}
            <div>
              <h2 className="text-xl font-semibold uppercase">
                Shipment ID:{" "}
                <span className="text-[#BF9B53]">
                  {quote.shipment?.shipmentCode || "N/A"}
                </span>
              </h2>

              <div className="mt-2 space-y-1 text-gray-700">
                <p>
                  <strong>Shipper:</strong>{" "}
                  {quote.shipper?.companyName || quote.shipper?.name || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {quote.shipper?.email || "N/A"}
                </p>
                <p>
                  <strong>Total Price:</strong> ${quote.totalPrice || 0}
                </p>
                <p>
                  <strong>Currency:</strong> {quote.currency || "N/A"}
                </p>
                <p>
                  <strong>Payment Method:</strong>{" "}
                  {quote.paymentMethod || "N/A"}
                </p>
                <p>
                  <strong>Payment Due:</strong> {quote.paymentDue || "N/A"}
                </p>
                <p>
                  <strong>Pickup Time:</strong> {quote.pickupTime || "N/A"}
                </p>
                <p>
                  <strong>Estimated Arrival:</strong>{" "}
                  {quote.estimatedArrivalTime || "N/A"}
                </p>
                <p>
                  <strong>Transport Type:</strong>{" "}
                  {quote.transportType || "N/A"}
                </p>
                <p>
                  <strong>Stalls Required:</strong> {quote.stallsRequired || 0}
                </p>
                <p>
                  <strong>Status:</strong> {quote.status || "N/A"}
                </p>
                {quote.notes && (
                  <p>
                    <strong>Notes:</strong> {quote.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Vehicle Info */}
            {quote.vehicle && (
              <div className="border rounded-md p-4 bg-gray-50 space-y-2">
                <h3 className="font-medium text-lg">Vehicle Info</h3>
                <p>
                  <strong>Vehicle Number:</strong> {quote.vehicle.vehicleNumber}
                </p>
                <p>
                  <strong>Vehicle Type:</strong> {quote.vehicle.vehicleType}
                </p>
                <p>
                  <strong>Stalls:</strong> {quote.vehicle.numberOfStalls} -{" "}
                  {quote.vehicle.stallSize || "N/A"}
                </p>
                {quote.vehicle.notes && (
                  <p>
                    <strong>Notes:</strong> {quote.vehicle.notes}
                  </p>
                )}
              </div>
            )}

            {/* Contract PDF */}
            {quote.contract?.url && (
              <div className="mt-4">
                <button
                  onClick={() =>
                    setVisibleContractId(
                      visibleContractId === quote._id ? null : quote._id
                    )
                  }
                  className="px-4 py-2 bg-[#997C42] text-white rounded hover:bg-[#BF9B53] transition"
                >
                  {visibleContractId === quote._id
                    ? "Hide Contract"
                    : "View Contract"}
                </button>

                {visibleContractId === quote._id && (
                  <div className="border rounded-md mt-2 overflow-auto">
                    <div className="w-full md:max-w-4xl mx-auto h-[400px]">
                      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <Viewer
                          fileUrl={quote.contract.url}
                          plugins={[defaultLayoutPluginInstance]}
                        />
                      </Worker>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Toast Notification */}
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "", visible: false })}
        />
      )}
    </div>
  );
};

export default ShipperQuotesPage;
