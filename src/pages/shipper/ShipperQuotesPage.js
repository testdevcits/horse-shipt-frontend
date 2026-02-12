import React, { useEffect, useState } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { useShipperQuote } from "../../contexts/shipperContext/ShipperQuoteContext";
import Toast from "../../components/common/Toast";
import PageLoader from "../../components/common/PageLoader";
import NotFound from "../../components/common/NoData";

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

  if (loading) return <PageLoader text="" fullScreen={false} />;

  // Filter quotes by last 6 digits of Shipment ID
  const filteredQuotes = quotes.filter((quote) => {
    const shipmentCode = quote.shipment?.shipmentCode || "";
    const lastSix = shipmentCode.slice(-6).toLowerCase();
    return lastSix.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="w-full mx-auto font-[Montserrat] animate-slide-fade-in">
      {/* Header + Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-[20px] sm:text-[22px] lg:text-[24px] font-medium text-gray-800 uppercase">
          My Quotes
        </h2>
        <input
          type="text"
          placeholder="Search by last 6 digits of Shipment ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-80 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#997C42]"
        />
      </div>

      {/* No Data */}
      {filteredQuotes.length === 0 && !loading && <NotFound />}

      {/* Quotes List */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {filteredQuotes.map((quote) => (
          <div
            key={quote._id}
            className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4 hover:shadow-lg transition"
          >
            {/* Shipment Info */}
            <div className="space-y-2">
              <h2 className="text-[18px] sm:text-[20px] lg:text-[22px] font-semibold text-[#BF9B53]">
                Shipment ID: {quote.shipment?.shipmentCode || "N/A"}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2  text-[14px] sm:text-[15px] lg:text-[16px]">
                <p>
                  <span className="font-semibold text-gray-700">Shipper:</span>{" "}
                  {quote.shipper?.companyName || quote.shipper?.name || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Email:</span>{" "}
                  {quote.shipper?.email || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">
                    Total Price:
                  </span>{" "}
                  ${quote.totalPrice || 0}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Currency:</span>{" "}
                  {quote.currency || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">
                    Payment Method:
                  </span>{" "}
                  {quote.paymentMethod || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">
                    Payment Due:
                  </span>{" "}
                  {quote.paymentDue || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Pickup:</span>{" "}
                  {quote.pickupTime || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">
                    Estimated Arrival:
                  </span>{" "}
                  {quote.estimatedArrivalTime || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">
                    Transport Type:
                  </span>{" "}
                  {quote.transportType || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">
                    Stalls Required:
                  </span>{" "}
                  {quote.stallsRequired || 0}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Status:</span>{" "}
                  {quote.status || "N/A"}
                </p>
              </div>

              {quote.notes && (
                <p className="text-gray-600 mt-2 text-[14px] sm:text-[15px] lg:text-[16px]">
                  <span className="font-semibold">Notes:</span> {quote.notes}
                </p>
              )}
            </div>

            {/* Vehicle Info */}
            {quote.vehicle && (
              <div className="bg-gray-50 p-4 rounded-lg border space-y-2">
                <h3 className="font-semibold text-[16px] sm:text-[17px] lg:text-[18px]">
                  Vehicle Info
                </h3>
                <p className="text-[14px] sm:text-[15px] lg:text-[16px]">
                  <span className="font-semibold">Vehicle Number:</span>{" "}
                  {quote.vehicle.vehicleNumber}
                </p>
                <p className="text-[14px] sm:text-[15px] lg:text-[16px]">
                  <span className="font-semibold">Vehicle Type:</span>{" "}
                  {quote.vehicle.vehicleType}
                </p>
                <p className="text-[14px] sm:text-[15px] lg:text-[16px]">
                  <span className="font-semibold">Stalls:</span>{" "}
                  {quote.vehicle.numberOfStalls} -{" "}
                  {quote.vehicle.stallSize || "N/A"}
                </p>
                {quote.vehicle.notes && (
                  <p className="text-[14px] sm:text-[15px] lg:text-[16px]">
                    <span className="font-semibold">Notes:</span>{" "}
                    {quote.vehicle.notes}
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
                  className="px-4 py-2 bg-[#997C42] text-white rounded-lg hover:bg-[#BF9B53] transition text-[14px] sm:text-[15px] lg:text-[16px]"
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
