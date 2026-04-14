import React, { useEffect, useRef, useState } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { TbLocationSearch } from "react-icons/tb";
import { useShipperQuote } from "../../contexts/shipperContext/ShipperQuoteContext";
import PageLoader from "../../components/common/PageLoader";
import NotFound from "../../components/common/NoData";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import {
  RiMoneyDollarCircleLine,
  RiTimeLine,
  RiTruckLine,
  RiFileTextLine,
  RiCloseCircleLine,
  RiDeleteBinLine,
} from "react-icons/ri";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify"; // ✅ NEW

const API_BASE_URL = "https://horse-shipt.vercel.app/api";

const ShipperQuotesPage = () => {
  const { token } = useAuth();
  const {
    quotes,
    loading,
    getMyQuotes,
    cancelQuote,
    deleteQuote,
    assignVehicleToQuote,
  } = useShipperQuote();

  const navigate = useNavigate();

  const [visibleContractId, setVisibleContractId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

  const tabsContainerRef = useRef(null);
  const [activeTab, setActiveTab] = useState("all");

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // ✅ FIXED TOAST
  const showToast = (message, type = "info") => {
    toast[type](message);
  };

  useEffect(() => {
    getMyQuotes();
  }, [getMyQuotes]);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/shipper/vehicles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVehicles(res.data.vehicles || []);
      } catch (err) {
        showToast("Failed to fetch vehicles", "error");
      }
    };
    fetchVehicles();
  }, [token]);

  if (loading) return <PageLoader />;

  const filteredQuotes = quotes
    .filter((quote) => {
      const code = quote.shipment?.shipmentCode || "";
      return code.slice(-6).toLowerCase().includes(searchTerm.toLowerCase());
    })
    .filter((quote) => {
      switch (activeTab) {
        case "accepted":
          return quote.status === "accepted" && !quote.isCancelled;
        case "cancelled":
          return quote.isCancelled;
        case "pending":
          return quote.status === "pending";
        default:
          return true;
      }
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
    if (modalType === "cancel") res = await cancelQuote(selectedQuote._id);
    else if (modalType === "delete") res = await deleteQuote(selectedQuote._id);

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

  const tabData = [
    { key: "all", label: "All Quotes", count: quotes.length },
    {
      key: "accepted",
      label: "Accepted",
      count: quotes.filter((q) => q.status === "accepted" && !q.isCancelled)
        .length,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      count: quotes.filter((q) => q.isCancelled).length,
    },
    {
      key: "pending",
      label: "Pending",
      count: quotes.filter((q) => q.status === "pending").length,
    },
  ];

  return (
    <div className="w-full mx-auto font-[Montserrat]">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800 uppercase">
          My Quotes
        </h2>
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search by last 6 characters of shipment ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-[#997C42] placeholder-gray-400"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <TbLocationSearch size={20} color="#997C42" />
          </span>
        </div>{" "}
        <button
          onClick={() => navigate(-1)}
          className="fixed bottom-6 right-6 bg-gray-600 text-white p-3 rounded-full shadow-lg hover:bg-[#BF9B53] transition"
        >
          <IoArrowBack className="w-5 h-5" />
        </button>
      </div>

      {/* TABS */}
      <div
        ref={tabsContainerRef}
        className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto scrollbar-hide"
      >
        {tabData.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              const tabButton = document.getElementById(`tab-${tab.key}`);
              tabButton?.scrollIntoView({
                behavior: "smooth",
                inline: "start",
              });
            }}
            id={`tab-${tab.key}`}
            className={`flex-shrink-0 px-4 py-2 font-semibold rounded-t-lg transition whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-[#997C42] text-white border-b-2 border-[#997C42]"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {`${tab.label} (${tab.count})`}
          </button>
        ))}
      </div>

      {/* QUOTES LIST */}
      {filteredQuotes.length === 0 ? (
        <NotFound />
      ) : (
        <div className="grid gap-6">
          {filteredQuotes.map((quote) => {
            const isExpired =
              quote.cancellationLastDate &&
              new Date() > new Date(quote.cancellationLastDate);
            const canDelete = !quote.contractAccepted;

            return (
              <div
                key={quote._id}
                className="bg-white rounded-md shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-[#BF9B53] space-y-5"
              >
                {/* HEADER */}
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-[#BF9B53] flex items-center gap-2">
                    <RiFileTextLine /> {quote.shipment?.shipmentCode}
                  </h2>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium uppercase ${
                      quote.isCancelled
                        ? "bg-red-600 text-[#fff]"
                        : "bg-green-600 text-white"
                    }`}
                  >
                    {quote.isCancelled ? "Cancelled" : quote.status}
                  </span>
                </div>

                {/* GRID */}
                <div className="grid md:grid-cols-3 gap-6 text-sm">
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <RiMoneyDollarCircleLine className="text-[#BF9B53]" />
                      <span className="text-gray-500">Price:</span>
                      <span className="font-semibold text-[#BF9B53]">
                        ${quote.totalPrice}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Currency:</span>{" "}
                      <span className="font-medium text-gray-800">
                        {quote.currency}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Payment:</span>{" "}
                      <span className="font-medium text-[#BF9B53]">
                        {quote.paymentMethod}
                      </span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <RiTimeLine className="text-[#BF9B53]" />
                      <span className="text-gray-500">Pickup:</span>
                      <span className="font-medium text-[#BF9B53]">
                        {quote.pickupTime}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Arrival:</span>{" "}
                      <span className="font-medium text-[#BF9B53]">
                        {quote.estimatedArrivalTime}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Transport:</span>{" "}
                      <span className="text-gray-800">
                        {quote.transportType}
                      </span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <RiTruckLine className="text-[#BF9B53]" />
                      <span className="text-gray-500">Stalls:</span>
                      <span className="text-gray-800">
                        {quote.stallsRequired}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Payment Status:</span>{" "}
                      <span className="font-medium text-[#BF9B53]">
                        {quote.paymentStatus}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Refund:</span>{" "}
                      <span className="font-medium text-[#BF9B53]">
                        {quote.refundStatus}
                      </span>
                    </p>
                  </div>
                </div>

                {/* NOTES */}
                {quote.notes && (
                  <div className="bg-[#BF9B53]/10 border border-[#BF9B53]/30 p-3 rounded-lg text-sm">
                    <span className="font-semibold text-[#BF9B53]">Notes:</span>{" "}
                    <span className="text-gray-700">{quote.notes}</span>
                  </div>
                )}

                {/* VEHICLE */}
                {quote.vehicle ? (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                    <p className="flex items-center gap-2">
                      <RiTruckLine className="text-[#BF9B53]" />
                      <span className="text-gray-500">Vehicle:</span>
                      <span className="text-gray-800">
                        {quote.vehicle.vehicleNumber}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Type:</span>{" "}
                      <span className="text-gray-800">
                        {quote.vehicle.vehicleType}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Stalls:</span>{" "}
                      <span className="text-gray-800">
                        {quote.vehicle.numberOfStalls}
                      </span>
                    </p>
                  </div>
                ) : (
                  quote.status === "accepted" &&
                  !quote.isCancelled && (
                    <button
                      onClick={() => {
                        setSelectedQuote(quote);
                        setVehicleModalOpen(true);
                      }}
                      className="px-4 py-2 bg-[#997C42] text-white rounded-lg text-sm"
                    >
                      Assign Vehicle
                    </button>
                  )
                )}

                {/* CANCELLED */}
                {quote.isCancelled && (
                  <div className="bg-[#BF9B53]/10 border border-[#BF9B53]/30 p-4 rounded-xl text-sm space-y-1">
                    <p className="text-[#BF9B53] font-semibold flex items-center gap-2">
                      <RiCloseCircleLine /> Shipment Cancelled
                    </p>
                    <p>
                      <span className="text-gray-500">Cancelled At:</span>{" "}
                      <span className="text-gray-800">
                        {quote.cancelledAt
                          ? new Date(quote.cancelledAt).toLocaleString()
                          : "N/A"}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Reason:</span>{" "}
                      <span className="text-gray-800">
                        {quote.cancelReason || "N/A"}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Refund:</span>{" "}
                      <span className="text-[#BF9B53]">
                        ${quote.refundAmount || 0}
                      </span>
                    </p>
                  </div>
                )}

                {!quote.isCancelled && quote.cancellationLastDate && (
                  <p className="text-sm text-[#BF9B53] font-medium">
                    {isExpired
                      ? "Cancellation expired"
                      : `Cancel before: ${new Date(
                          quote.cancellationLastDate
                        ).toLocaleString()}`}
                  </p>
                )}

                {/* ACTIONS */}
                {/* ACTIONS */}
                <div className="flex flex-wrap gap-3 pt-2 items-center justify-between">
                  {/* LEFT SIDE BUTTONS */}
                  <div className="flex gap-3 flex-wrap">
                    {quote.contract?.url && (
                      <button
                        onClick={() =>
                          setVisibleContractId(
                            visibleContractId === quote._id ? null : quote._id
                          )
                        }
                        className="px-4 py-2 bg-[#BF9B53] hover:bg-[#a5843f] text-white rounded-lg text-sm"
                      >
                        {visibleContractId === quote._id
                          ? "Hide Contract"
                          : "View Contract"}
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => openModal(quote, "delete")}
                        className="px-4 py-2 border border-[#BF9B53] text-[#BF9B53] hover:bg-[#BF9B53]/10 rounded-lg text-sm flex items-center gap-1"
                      >
                        <RiDeleteBinLine /> Delete
                      </button>
                    )}
                  </div>

                  {/* RIGHT SIDE (CANCEL BUTTON) */}
                  {!isExpired && !quote.isCancelled && (
                    <button
                      onClick={() => openModal(quote, "cancel")}
                      className="ml-auto px-4 py-2 border border-red-500 text-red-500 hover:bg-[#BF9B53]/10 rounded-lg text-sm flex items-center gap-1"
                    >
                      <RiCloseCircleLine /> Cancel Quotes
                    </button>
                  )}
                </div>

                {/* PDF */}
                {visibleContractId === quote._id && (
                  <div className="mt-4 border rounded-xl overflow-hidden h-[400px]">
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
      )}

      {/* CANCEL / DELETE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-[90%] max-w-xl rounded-md shadow-xl p-6">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {modalType === "cancel" ? "Cancel Shipment" : "Delete Quote"}
              </h3>

              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            {/* MESSAGE */}
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {modalType === "cancel"
                ? "Are you sure you want to cancel this shipment?"
                : "This quote is not accepted. Are you sure you want to delete it?"}
            </p>

            {modalType === "cancel" &&
              selectedQuote?.paymentStatus === "paid" && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-5 space-y-3">
                  <p className="text-sm font-semibold text-red-600 flex items-center gap-2">
                    Cancellation Charges Will Apply
                  </p>

                  <p className="text-xs text-gray-700 leading-relaxed">
                    The customer has already completed the payment for this
                    shipment. If you cancel now, the customer will receive a{" "}
                    <b>100% refund</b>.
                  </p>

                  <div className="bg-white border rounded-md p-3 text-xs text-gray-700 space-y-1">
                    <p>You (Shipper) will be charged:</p>
                    <p className="ml-2">- Platform service fee</p>
                    <p className="ml-2">- Payment processing fee</p>
                  </div>

                  <div className="bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l-4 border-[#BF9B53] text-xs p-4">
                    These charges will be automatically deducted from your saved
                    payment method (card).
                  </div>
                </div>
              )}

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3">
              {/* NO BUTTON */}
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                No
              </button>

              {/* YES BUTTON */}
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-lg text-white transition flex items-center justify-center min-w-[120px] ${
                  actionLoading
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {actionLoading ? "Processing..." : "Yes, Cancel Shipment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VEHICLE ASSIGN MODAL */}
      {vehicleModalOpen && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-md">
            <h3 className="text-lg font-semibold mb-3">Assign Vehicle</h3>
            <select
              value={selectedVehicleId || ""}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">Select vehicle</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.vehicleNumber} - {v.vehicleType} ({v.numberOfStalls}{" "}
                  stalls)
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setVehicleModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!selectedVehicleId)
                    return showToast("Select a vehicle", "error");
                  const res = await assignVehicleToQuote(
                    selectedQuote._id,
                    selectedVehicleId
                  );
                  if (res?.success) {
                    showToast("Vehicle assigned", "success");
                    setVehicleModalOpen(false);
                    setSelectedVehicleId(null);
                    getMyQuotes();
                  } else showToast("Failed to assign vehicle", "error");
                }}
                className="px-4 py-2 bg-[#997C42] text-white rounded"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipperQuotesPage;
