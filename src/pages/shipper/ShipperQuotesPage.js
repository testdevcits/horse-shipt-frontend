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
  const { quotes, loading, getMyQuotes, cancelQuote, deleteQuote } =
    useShipperQuote();

  const [visibleContractId, setVisibleContractId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [toast, setToast] = useState({ message: "", type: "", visible: false });

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    getMyQuotes();
  }, [getMyQuotes]);

  const showToast = (message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  };

  if (loading) return <PageLoader />;

  const filteredQuotes = quotes.filter((quote) => {
    const code = quote.shipment?.shipmentCode || "";
    return code.slice(-6).toLowerCase().includes(searchTerm.toLowerCase());
  });

  const openModal = (quote, type) => {
    setSelectedQuote(quote);
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedQuote(null);
  };

  const handleAction = async () => {
    if (!selectedQuote) return;

    setActionLoading(true);

    let res;

    if (modalType === "cancel") {
      res = await cancelQuote(selectedQuote._id);
    } else if (modalType === "delete") {
      res = await deleteQuote(selectedQuote._id);
    }

    if (res?.success) {
      showToast(
        modalType === "cancel"
          ? "Shipment cancelled"
          : "Quote deleted successfully",
        "success"
      );
      getMyQuotes();
    } else {
      showToast("Action failed", "error");
    }

    setActionLoading(false);
    closeModal();
  };

  return (
    <div className="w-full mx-auto font-[Montserrat]">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800 uppercase">
          My Quotes
        </h2>

        <input
          type="text"
          placeholder="Search shipment ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#997C42]"
        />
      </div>

      {filteredQuotes.length === 0 && <NotFound />}

      {/* LIST */}
      <div className="grid gap-6">
        {filteredQuotes.map((quote) => {
          const isExpired =
            quote.cancellationLastDate &&
            new Date() > new Date(quote.cancellationLastDate);

          const canDelete = !quote.contractAccepted;

          return (
            <div
              key={quote._id}
              className="bg-white rounded-2xl shadow-lg p-6 space-y-4 border hover:shadow-xl transition"
            >
              {/* TOP */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-[#BF9B53]">
                  {quote.shipment?.shipmentCode}
                </h2>

                <span
                  className={`text-sm px-3 py-1 rounded-full text-white ${
                    quote.isCancelled
                      ? "bg-red-500"
                      : quote.status === "accepted"
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }`}
                >
                  {quote.isCancelled ? "Cancelled" : quote.status}
                </span>
              </div>

              {/* DETAILS GRID */}
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p>
                    <b>Price:</b> ${quote.totalPrice}
                  </p>
                  <p>
                    <b>Currency:</b> {quote.currency}
                  </p>
                  <p>
                    <b>Payment:</b> {quote.paymentMethod}
                  </p>
                </div>

                <div>
                  <p>
                    <b>Pickup:</b> {quote.pickupTime}
                  </p>
                  <p>
                    <b>Arrival:</b> {quote.estimatedArrivalTime}
                  </p>
                  <p>
                    <b>Transport:</b> {quote.transportType}
                  </p>
                </div>

                <div>
                  <p>
                    <b>Stalls:</b> {quote.stallsRequired}
                  </p>
                  <p>
                    <b>Payment Status:</b> {quote.paymentStatus}
                  </p>
                  <p>
                    <b>Refund:</b> {quote.refundStatus}
                  </p>
                </div>
              </div>

              {/* NOTES */}
              {quote.notes && (
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <b>Notes:</b> {quote.notes}
                </div>
              )}

              {/* VEHICLE */}
              {quote.vehicle && (
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p>
                    <b>Vehicle:</b> {quote.vehicle.vehicleNumber}
                  </p>
                  <p>
                    <b>Type:</b> {quote.vehicle.vehicleType}
                  </p>
                  <p>
                    <b>Stalls:</b> {quote.vehicle.numberOfStalls}
                  </p>
                </div>
              )}

              {/* CANCELLATION DETAILS */}
              {quote.isCancelled && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-sm space-y-1">
                  <p className="text-red-600 font-semibold">
                    Shipment Cancelled
                  </p>

                  <p>
                    <b>Cancelled At:</b>{" "}
                    {quote.cancelledAt
                      ? new Date(quote.cancelledAt).toLocaleString()
                      : "N/A"}
                  </p>

                  <p>
                    <b>Reason:</b> {quote.cancelReason || "N/A"}
                  </p>

                  <p>
                    <b>Refund Amount:</b> ${quote.refundAmount || 0}
                  </p>

                  <p>
                    <b>Refund Status:</b> {quote.refundStatus}
                  </p>

                  {quote.cancellationFee && (
                    <p>
                      <b>Cancellation Fee Charged:</b> ${quote.cancellationFee}
                    </p>
                  )}
                </div>
              )}

              {/* CANCELLATION WINDOW */}
              {!quote.isCancelled && quote.cancellationLastDate && (
                <p
                  className={`text-sm ${
                    isExpired ? "text-red-500" : "text-yellow-600"
                  }`}
                >
                  {isExpired
                    ? "Cancellation expired"
                    : `Cancel before: ${new Date(
                        quote.cancellationLastDate
                      ).toLocaleString()}`}
                </p>
              )}

              {/* BUTTONS */}
              <div className="flex flex-wrap gap-3">
                {/* CONTRACT */}
                {quote.contract?.url && (
                  <button
                    onClick={() =>
                      setVisibleContractId(
                        visibleContractId === quote._id ? null : quote._id
                      )
                    }
                    className="px-4 py-2 bg-[#997C42] text-white rounded"
                  >
                    View Contract
                  </button>
                )}

                {/* CANCEL */}
                {!isExpired && !quote.isCancelled && (
                  <button
                    onClick={() => openModal(quote, "cancel")}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                  >
                    Cancel
                  </button>
                )}

                {/* DELETE */}
                {canDelete && (
                  <button
                    onClick={() => openModal(quote, "delete")}
                    className="px-4 py-2 bg-black text-white rounded"
                  >
                    Delete Quote
                  </button>
                )}
              </div>

              {/* PDF */}
              {visibleContractId === quote._id && (
                <div className="mt-4 border rounded h-[400px]">
                  <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                    <Viewer
                      fileUrl={quote.contract.url}
                      plugins={[defaultLayoutPluginInstance]}
                    />
                  </Worker>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-md">
            <h3 className="text-lg font-semibold mb-3">
              {modalType === "cancel" ? "Cancel Shipment" : "Delete Quote"}
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              {modalType === "cancel"
                ? "Are you sure you want to cancel this shipment?"
                : "This quote is not accepted. Do you want to delete it?"}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                No
              </button>

              <button
                onClick={handleAction}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                {actionLoading ? "Processing..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
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
