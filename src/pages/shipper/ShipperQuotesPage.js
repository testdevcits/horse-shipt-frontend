import React, { useEffect, useRef, useState } from "react";
import { TbLocationSearch } from "react-icons/tb";
import { useShipperQuote } from "../../contexts/shipperContext/ShipperQuoteContext";
import PageLoader from "../../components/common/PageLoader";
import NotFound from "../../components/common/NoData";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import {
  RiTruckLine,
  RiFileTextLine,
  RiCloseCircleLine,
  RiDeleteBinLine,
} from "react-icons/ri";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

const API_BASE_URL = "https://horse-shipt.vercel.app/api";

const hasAssignedVehicle = (quote) => {
  if (!quote?.vehicle) return false;
  if (typeof quote.vehicle === "string") return true;
  return Object.keys(quote.vehicle).length > 0;
};

const isPdfFile = (url = "") =>
  /\.pdf($|\?)/i.test(url) || url.toLowerCase().includes("/raw/upload/");

const getHorseImages = (quote) =>
  (quote?.shipment?.horses || [])
    .map((horse) => ({
      id: horse._id || horse.name,
      url: horse.photo?.url,
      name: horse.name || "Horse",
      breed: horse.breed || horse.breedName || "",
    }))
    .filter((horse) => horse.url);

const HorseImageStrip = ({ quote }) => {
  const horses = getHorseImages(quote);
  const firstHorse = horses[0];

  return firstHorse ? (
    <figure className="relative h-32 sm:h-36 bg-slate-100 border border-slate-200 overflow-hidden">
      <img
        src={firstHorse.url}
        alt={firstHorse.name}
        className="h-full w-full object-cover"
      />
      <figcaption className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2">
        <p className="text-sm font-semibold text-white truncate">
          {firstHorse.name}
        </p>
        <p className="text-xs text-white/80 truncate">
          {firstHorse.breed || `${horses.length} horse${horses.length > 1 ? "s" : ""}`}
        </p>
      </figcaption>
    </figure>
  ) : (
    <div className="h-32 sm:h-36 border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-xs font-semibold uppercase tracking-wide text-slate-500">
      No horse image
    </div>
  );
};

const StatusBadge = ({ quote }) => (
  <span
    className={`px-3 py-1 text-xs font-semibold uppercase ${
      quote.isCancelled
        ? "bg-red-600 text-white"
        : quote.status === "accepted"
        ? "bg-emerald-600 text-white"
        : quote.status === "pending"
        ? "bg-amber-500 text-white"
        : "bg-slate-700 text-white"
    }`}
  >
    {quote.isCancelled ? "Cancelled" : quote.status}
  </span>
);

const ContractPreview = ({ quote }) => {
  const contractUrl = quote?.contract?.url;
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!contractUrl || !isPdfFile(contractUrl)) {
      setPreviewUrl("");
      setPreviewError("");
      return undefined;
    }

    let objectUrl = "";
    let cancelled = false;

    const loadPreview = async () => {
      setPreviewLoading(true);
      setPreviewError("");

      try {
        const res = await fetch(contractUrl);
        if (!res.ok) throw new Error("Failed to load contract");

        const blob = await res.blob();
        objectUrl = URL.createObjectURL(
          new Blob([blob], { type: "application/pdf" })
        );

        if (!cancelled) setPreviewUrl(objectUrl);
      } catch (error) {
        if (!cancelled) {
          setPreviewError("Preview could not be loaded. Open the contract in a new tab.");
        }
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [contractUrl]);

  if (!contractUrl) return null;

  return (
    <div className="mt-4 border overflow-hidden bg-gray-50">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b bg-white">
        <span className="text-sm font-semibold text-gray-700">
          Contract Preview
        </span>
        <a
          href={contractUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-[#BF9B53] hover:underline"
        >
          Open full contract
        </a>
      </div>

      {previewLoading && (
        <div className="h-[420px] flex items-center justify-center text-sm text-gray-500 bg-white">
          Loading contract preview...
        </div>
      )}

      {!previewLoading && previewError && (
        <div className="h-[240px] flex flex-col items-center justify-center gap-3 text-center bg-white px-4">
          <p className="text-sm text-gray-600">{previewError}</p>
          <a
            href={contractUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#BF9B53] text-white text-sm font-semibold"
          >
            Open Contract
          </a>
        </div>
      )}

      {!previewLoading && !previewError && isPdfFile(contractUrl) && previewUrl && (
        <iframe
          src={previewUrl}
          title={`Contract ${quote._id}`}
          className="w-full h-[520px] bg-white"
        />
      )}

      {!isPdfFile(contractUrl) && (
        <img
          src={contractUrl}
          alt="Contract"
          className="w-full max-h-[520px] object-contain bg-white"
        />
      )}
    </div>
  );
};

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

  const isInTransitQuote = (quote) => {
    if (!quote || quote.isCancelled || quote.status === "cancelled") return false;
    if (quote.shipment?.status === "delivered") return false;

    return hasAssignedVehicle(quote);
  };

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
        case "in_transit":
          return isInTransitQuote(quote);
        case "upcoming":
          return (
            quote.status === "accepted" &&
            !quote.isCancelled &&
            !isInTransitQuote(quote)
          );
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
      key: "in_transit",
      label: "In Transit",
      count: quotes.filter((q) => isInTransitQuote(q)).length,
    },
    {
      key: "upcoming",
      label: "Upcoming",
      count: quotes.filter(
        (q) => q.status === "accepted" && !q.isCancelled && !isInTransitQuote(q)
      ).length,
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
      <div className="flex flex-col md:flex-row justify-between mb-4 gap-4 bg-white border border-slate-200 p-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 uppercase">
            My Quotes
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Review shipment offers, contracts, vehicles, and payment status.
          </p>
        </div>
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search by last 6 characters of shipment ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-slate-300 focus:ring-2 focus:ring-[#997C42] placeholder-gray-400"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <TbLocationSearch size={20} color="#997C42" />
          </span>
        </div>{" "}
        <button
          onClick={() => navigate(-1)}
          className="fixed bottom-6 right-6 bg-gray-600 text-white p-3 shadow-lg hover:bg-[#BF9B53] transition"
        >
          <IoArrowBack className="w-5 h-5" />
        </button>
      </div>

      {/* TABS */}
      <div
        ref={tabsContainerRef}
        className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto scrollbar-hide bg-white px-2 pt-2"
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
            className={`flex-shrink-0 px-4 py-2 font-semibold transition whitespace-nowrap border border-b-0 ${
              activeTab === tab.key
                ? "bg-[#997C42] text-white border-[#997C42]"
                : "bg-gray-50 text-gray-700 border-slate-200 hover:bg-gray-100"
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
        <div className="grid gap-4">
          {filteredQuotes.map((quote) => {
            const isExpired =
              quote.cancellationLastDate &&
              new Date() > new Date(quote.cancellationLastDate);
            const canDelete = !quote.contractAccepted;

            return (
              <div
                key={quote._id}
                className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition"
              >
                <div className="grid md:grid-cols-[180px_1fr] gap-4 p-4">
                  <HorseImageStrip quote={quote} />

                  <div>
                    <header className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 border-b border-slate-200 pb-3">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <RiFileTextLine className="text-[#997C42]" />
                          {quote.shipment?.shipmentCode || "Shipment"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                          {quote.shipment?.pickupLocation || "Pickup N/A"} to{" "}
                          {quote.shipment?.deliveryLocation || "Delivery N/A"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge quote={quote} />
                        <span className="text-xl font-bold text-[#997C42]">
                          ${quote.totalPrice || 0}
                        </span>
                      </div>
                    </header>

                    <dl className="grid sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-3 py-4 text-sm">
                      <div>
                        <dt className="text-slate-500">Transport</dt>
                        <dd className="font-semibold text-slate-800">
                          {quote.transportType || "N/A"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Payment</dt>
                        <dd className="font-semibold text-slate-800">
                          {quote.paymentMethod || "N/A"} /{" "}
                          {quote.paymentStatus || "N/A"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Stalls</dt>
                        <dd className="font-semibold text-slate-800">
                          {quote.stallsRequired || "N/A"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Refund</dt>
                        <dd className="font-semibold text-slate-800">
                          {quote.refundStatus || "N/A"}
                        </dd>
                      </div>
                    </dl>

                    {quote.vehicle && (
                      <p className="text-sm bg-slate-50 border border-slate-200 p-3">
                        <RiTruckLine className="inline text-[#997C42] mr-1" />
                        <span className="font-semibold">Vehicle:</span>{" "}
                        {quote.vehicle.vehicleNumber || "N/A"} |{" "}
                        {quote.vehicle.vehicleType || "N/A"} |{" "}
                        {quote.vehicle.numberOfStalls || 0} stalls | Trip:{" "}
                        <span className="capitalize">
                          {quote.tripStatus || "notStarted"}
                        </span>
                      </p>
                    )}

                    {!quote.vehicle &&
                      quote.status === "accepted" &&
                      !quote.isCancelled && (
                        <button
                          onClick={() => {
                            setSelectedQuote(quote);
                            setVehicleModalOpen(true);
                          }}
                          className="px-4 py-2 bg-[#997C42] text-white text-sm font-semibold"
                        >
                          Assign Vehicle
                        </button>
                      )}

                    {quote.notes && (
                      <p className="mt-3 text-sm bg-[#997C42]/10 border border-[#997C42]/30 p-3">
                        <span className="font-semibold text-[#997C42]">
                          Notes:
                        </span>{" "}
                        {quote.notes}
                      </p>
                    )}

                    {quote.isCancelled && (
                      <p className="mt-3 text-sm bg-red-50 border border-red-200 p-3 text-red-700">
                        <RiCloseCircleLine className="inline mr-1" />
                        Cancelled{" "}
                        {quote.cancelledAt
                          ? new Date(quote.cancelledAt).toLocaleString()
                          : ""}
                        {quote.cancelReason
                          ? ` | Reason: ${quote.cancelReason}`
                          : ""}
                      </p>
                    )}

                    {!quote.isCancelled && quote.cancellationLastDate && (
                      <p className="mt-3 text-sm text-[#7f6637] font-medium">
                        {isExpired
                          ? "Cancellation expired"
                          : `Cancel before: ${new Date(
                              quote.cancellationLastDate
                            ).toLocaleString()}`}
                      </p>
                    )}

                    <footer className="flex flex-wrap gap-3 pt-4 mt-4 border-t border-slate-200">
                      {quote.contract?.url && (
                        <button
                          onClick={() =>
                            setVisibleContractId(
                              visibleContractId === quote._id ? null : quote._id
                            )
                          }
                          className="px-4 py-2 bg-[#997C42] hover:bg-[#806834] text-white text-sm font-semibold"
                        >
                          {visibleContractId === quote._id
                            ? "Hide Contract"
                            : "View Contract"}
                        </button>
                      )}

                      {quote.shipperContract?.url && (
                        <button
                          onClick={() =>
                            window.open(
                              quote.shipperContract.url,
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                          className="px-4 py-2 border border-[#997C42] text-[#997C42] hover:bg-[#997C42]/10 text-sm font-semibold"
                        >
                          View Shipper Contract
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => openModal(quote, "delete")}
                          className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold flex items-center gap-1"
                        >
                          <RiDeleteBinLine /> Delete
                        </button>
                      )}

                      {activeTab !== "pending" &&
                        quote.status !== "pending" &&
                        !isExpired &&
                        !quote.isCancelled && (
                          <button
                            onClick={() => openModal(quote, "cancel")}
                            className="ml-auto px-4 py-2 border border-red-500 text-red-600 hover:bg-red-50 text-sm font-semibold flex items-center gap-1"
                          >
                            <RiCloseCircleLine /> Cancel Quote
                          </button>
                        )}
                    </footer>

                    {visibleContractId === quote._id && (
                      <ContractPreview quote={quote} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CANCEL / DELETE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-[90%] max-w-xl shadow-xl p-6">
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
                <div className="bg-red-50 border border-red-200 p-4 mb-5 space-y-3">
                  <p className="text-sm font-semibold text-red-600 flex items-center gap-2">
                    Cancellation Charges Will Apply
                  </p>

                  <p className="text-xs text-gray-700 leading-relaxed">
                    The customer has already completed the payment for this
                    shipment. If you cancel now, the customer will receive a{" "}
                    <b>100% refund</b>.
                  </p>

                  <div className="bg-white border p-3 text-xs text-gray-700 space-y-1">
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
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                No
              </button>

              {/* YES BUTTON */}
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className={`px-4 py-2 text-white transition flex items-center justify-center min-w-[120px] ${
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
          <div className="bg-white p-6 w-[90%] max-w-md">
            <h3 className="text-lg font-semibold mb-3">Assign Vehicle</h3>
            <select
              value={selectedVehicleId || ""}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full p-2 border mb-4"
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
                className="px-4 py-2 bg-gray-200"
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
                    setActiveTab("in_transit");
                    getMyQuotes();
                  } else showToast("Failed to assign vehicle", "error");
                }}
                className="px-4 py-2 bg-[#997C42] text-white"
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
