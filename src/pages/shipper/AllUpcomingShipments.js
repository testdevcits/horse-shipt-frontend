import React, { useEffect, useState } from "react";
import { useShipperQuote } from "../../contexts/shipperContext/ShipperQuoteContext";
import { useShipperDelivery } from "../../contexts/shipperContext/ShipperDeliveryContext";
import { useNavigate } from "react-router-dom";
import {
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiNavigation,
  FiMapPin,
  FiHash,
  FiDollarSign,
  FiInfo,
} from "react-icons/fi";
import { MdClose } from "react-icons/md";
import PageLoader from "../../components/common/PageLoader";
import { useAuth } from "../../contexts/AuthContext";
import { API_BASE_URL } from "../../config/api";

const getDocumentFileName = (quote, documentType) => {
  const shipmentCode = quote?.shipment?.shipmentCode || quote?._id || "contract";
  if (documentType === "shipper") {
    return quote?.shipperContract?.originalName || `${shipmentCode}-shipper.pdf`;
  }
  return `${shipmentCode}.pdf`;
};

const openQuoteDocument = async ({ quote, quoteId, documentType, token }) => {
  const response = await fetch(
    `${API_BASE_URL}/shipper/quotes/${quoteId}/documents/${documentType}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) throw new Error("Unable to open contract");
  const blob = await response.blob();
  const contentType = response.headers.get("content-type") || blob.type || "";
  const header = await blob.slice(0, 4).text();
  if (!contentType.toLowerCase().includes("pdf") && header !== "%PDF") {
    throw new Error("Contract is not available as a valid PDF");
  }

  const url = URL.createObjectURL(
    new File([blob], getDocumentFileName(quote, documentType), {
      type: "application/pdf",
    })
  );
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

const hasAssignedVehicle = (quote) => {
  if (!quote?.vehicle) return false;
  if (typeof quote.vehicle === "string") return true;
  return Object.keys(quote.vehicle).length > 0;
};

const isCompletedQuote = (quote) =>
  quote?.tripStatus === "completed" ||
  quote?.shipment?.status === "delivered" ||
  quote?.shipment?.status === "completed";

/* ─────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────*/
const EmptyState = ({ icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center border border-dashed border-gray-200 bg-white py-16 text-center">
    <div className="mb-4 bg-[#BF9B53]/10 p-4">{icon}</div>
    <h3 className="text-base font-semibold text-[#111827]">{title}</h3>
    <p className="mt-1 max-w-xs text-sm text-gray-500">{subtitle}</p>
  </div>
);

/* ─────────────────────────────────────────
   SHIPMENT CARD
───────────────────────────────────────────*/
const QuoteShipmentCard = ({
  quote,
  tabKey,
  onTrack,
  token,
}) => {
  const isCancelled =
    quote.isCancelled === true || quote.status === "cancelled";
  const isCompleted = tabKey === "completed" || isCompletedQuote(quote);

  const shipment = quote.shipment || {};
  const paymentLabel = quote.paymentStatus
    ? `Payment: ${quote.paymentStatus}`
    : "Payment: N/A";
  const priceLabel =
    quote.totalPrice !== undefined && quote.totalPrice !== null
      ? `${quote.currency === "USD" ? "$" : quote.currency || "$"}${
          quote.totalPrice
        }`
      : "$0";

  return (
    <div
      className={`bg-white px-4 py-4 sm:px-5 lg:px-6 ${
        isCancelled ? "opacity-75" : ""
      }`}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-1.5 font-montserrat text-[11px] font-medium leading-[18px] text-[#6B7280]">
          <FiHash size={12} />
          <span>{shipment.shipmentCode || shipment._id || quote._id}</span>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <span
            className={`inline-flex h-[26px] items-center gap-1.5 rounded-[4px] border px-3 font-montserrat text-[11px] font-bold uppercase leading-none ${
              isCancelled
                ? "border-red-300 bg-red-50 text-red-600"
                : isCompleted
                ? "border-blue-300 bg-blue-50 text-blue-600"
                : "border-emerald-500 bg-emerald-50 text-emerald-700"
            }`}
          >
            {isCancelled ? (
              <FiXCircle size={13} />
            ) : isCompleted ? (
              <FiCheckCircle size={13} />
            ) : (
              <FiCheckCircle size={13} />
            )}
            {isCancelled ? "Cancelled" : isCompleted ? "Completed" : "Accepted"}
          </span>
          <span
            className={`inline-flex h-[26px] items-center rounded-[4px] border px-3 font-montserrat text-[11px] font-bold uppercase leading-none ${
              quote.paymentStatus === "paid"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-[#BF9B53] bg-[#BF9B53]/5 text-[#735D32]"
            }`}
          >
            {paymentLabel}
          </span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(230px,280px)_minmax(260px,1fr)_minmax(230px,280px)] lg:items-center">
        <div className="space-y-3">
          <div className="flex items-start gap-2 font-montserrat text-[12px] font-semibold leading-[20px] text-[#4B5563]">
            <FiMapPin className="mt-0.5 shrink-0 text-[#BF9B53]" size={14} />
            <span>{shipment.pickupLocation || "Pickup location"}</span>
          </div>
          <div className="flex items-center gap-2 font-montserrat text-[12px] font-medium leading-[20px] text-[#4B5563]">
            <FiNavigation className="text-[#4B5563]" size={13} />
            <span>
              {shipment.numberOfHorses || 1} Horse
              {(shipment.numberOfHorses || 1) !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 font-montserrat text-[12px] font-medium leading-[20px] text-[#4B5563]">
            <FiDollarSign className="text-[#4B5563]" size={13} />
            <span>
              {priceLabel} · {quote.paymentMethod || "card"} · due on{" "}
              {quote.paymentDue || "delivery"}
            </span>
          </div>
        </div>

        <div className="relative hidden h-[44px] max-w-[520px] items-center justify-center justify-self-center bg-[#F3F4F6] lg:flex lg:w-full">
          <span className="absolute left-7 right-7 top-1/2 h-px -translate-y-1/2 bg-[#BF9B53]" />
          <span className="absolute left-7 top-1/2 h-[6px] w-[6px] -translate-y-1/2 rounded-full bg-[#BF9B53]" />
          <span className="absolute right-7 top-1/2 h-[6px] w-[6px] -translate-y-1/2 rounded-full bg-[#BF9B53]" />
          <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#735D32] shadow-sm">
            <FiTruck size={18} />
          </span>
        </div>

        <div className="flex items-start gap-2 font-montserrat text-[12px] font-semibold leading-[20px] text-[#4B5563] lg:justify-end lg:text-right">
          <FiMapPin className="mt-0.5 shrink-0 text-emerald-500" size={14} />
          <span>{shipment.deliveryLocation || "Delivery location"}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          {quote.shipperContract?.url && (
            <button
              onClick={() =>
                openQuoteDocument({
                  quote,
                  quoteId: quote._id,
                  documentType: "shipper",
                  token,
                }).catch((error) => alert(error.message))
              }
              className="h-[34px] min-w-[130px] rounded-[4px] bg-[#BF9B53] px-4 font-montserrat text-[12px] font-bold uppercase text-white transition hover:bg-tabActive"
            >
              View Contract
            </button>
          )}

          {!isCancelled && !isCompleted && (
            <button
              onClick={() => onTrack(quote)}
              className="h-[34px] min-w-[130px] rounded-[4px] border border-[#BF9B53] px-4 font-montserrat text-[12px] font-bold uppercase text-[#BF9B53] transition hover:bg-[#BF9B53]/5"
            >
              Track Shipment
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          {isCompleted && (
            <div className="flex h-9 items-center gap-2 border border-blue-200 bg-blue-50 px-3 text-[12px] font-bold uppercase text-blue-600">
              <FiCheckCircle size={14} />
              Delivery Verified
            </div>
          )}

          {isCancelled && (
            <div className="flex h-9 items-center gap-2 border border-red-200 bg-red-50 px-3 text-[12px] font-bold uppercase text-red-500">
              <FiXCircle size={14} />
              Shipment Cancelled
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────*/
const AllUpcomingShipments = () => {
  const { quotes, loading, getMyQuotes } = useShipperQuote();
  const { token } = useAuth();
  const {
    markDelivered,
    verifyOtp,
    loading: deliveryLoading,
  } = useShipperDelivery();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    getMyQuotes();
  }, [getMyQuotes]);

  const isInTransitQuote = (quote) => {
    if (quote.isCancelled === true || quote.status === "cancelled") return false;
    if (isCompletedQuote(quote)) return false;

    return hasAssignedVehicle(quote);
  };

  /*
   * TAB LOGIC (based on real API data):
   *
   * UPCOMING  : quote.status === "accepted" AND not cancelled AND shipment.status !== "delivered"
   *             NOTE: paymentStatus "paid" only means upfront payment — NOT delivery confirmation
   *
   * COMPLETED : shipment.status === "delivered" AND not cancelled
   *
   * CANCELLED : isCancelled === true OR quote.status === "cancelled"
   */
  const inTransitShipments = quotes.filter((q) => isInTransitQuote(q));

  const upcomingShipments = quotes.filter((q) => {
    if (q.isCancelled === true || q.status === "cancelled") return false;
    if (isCompletedQuote(q)) return false;
    if (isInTransitQuote(q)) return false;
    return q.status === "accepted";
  });

  const completedShipments = quotes.filter((q) => {
    if (q.isCancelled === true || q.status === "cancelled") return false;
    return isCompletedQuote(q);
  });

  const cancelledShipments = quotes.filter((q) => {
    return q.isCancelled === true || q.status === "cancelled";
  });

  const tabs = [
    {
      key: "in_transit",
      label: "In Transit",
      count: inTransitShipments.length,
      data: inTransitShipments,
      icon: <FiNavigation size={14} />,
      emptyIcon: <FiNavigation size={32} className="text-[#BF9B53]" />,
      emptyTitle: "No active transit shipments",
      emptySubtitle:
        "Shipments with an assigned vehicle will appear here once transport is underway.",
      info: (
        <p>
          <span className="font-semibold text-[#BF9B53]">In transit</span> —
          These shipments already have a vehicle assigned and are in the active
          transportation stage. Use tracking to monitor progress and continue
          delivery updates.
        </p>
      ),
    },
    {
      key: "upcoming",
      label: "Upcoming",
      count: upcomingShipments.length,
      data: upcomingShipments,
      icon: <FiClock size={14} />,
      emptyIcon: <FiTruck size={32} className="text-[#BF9B53]" />,
      emptyTitle: "No upcoming shipments",
      emptySubtitle:
        "Shipments you've been accepted for and need to deliver will show up here.",
      info: (
        <p>
          <span className="font-semibold text-[#BF9B53]">
            Upcoming shipments
          </span>{" "}
          — These are shipments where your quote has been accepted by the horse
          owner and you are scheduled to pick up and deliver the horses. Once
          you complete delivery, click{" "}
          <span className="font-semibold">"Mark Delivered"</span> and enter the
          OTP provided by the horse owner to confirm delivery.
        </p>
      ),
    },
    {
      key: "completed",
      label: "Completed",
      count: completedShipments.length,
      data: completedShipments,
      icon: <FiCheckCircle size={14} />,
      emptyIcon: <FiCheckCircle size={32} className="text-[#BF9B53]" />,
      emptyTitle: "No completed shipments yet",
      emptySubtitle:
        "Once you deliver a shipment and the OTP is verified, it will appear here.",
      info: (
        <p>
          <span className="font-semibold text-[#BF9B53]">
            Completed shipments
          </span>{" "}
          — These shipments have been successfully delivered and the OTP has
          been verified by both parties. Your payment will be processed based on
          the agreed payment terms.
        </p>
      ),
    },
    {
      key: "cancelled",
      label: "Cancelled",
      count: cancelledShipments.length,
      data: cancelledShipments,
      icon: <FiXCircle size={14} />,
      emptyIcon: <FiXCircle size={32} className="text-[#BF9B53]" />,
      emptyTitle: "No cancelled shipments",
      emptySubtitle:
        "Any shipments that were cancelled by you or the horse owner will appear here.",
      info: (
        <p>
          <span className="font-semibold text-[#BF9B53]">
            Cancelled shipments
          </span>{" "}
          — These shipments were cancelled either by you or the horse owner. If
          a cancellation fee applies, it will be reflected in your account.
          Contact support if you believe a cancellation was made in error.
        </p>
      ),
    },
  ];

  const currentTab = tabs.find((t) => t.key === activeTab);

  /* ── HANDLERS ── */
  const handleMarkDelivered = async (quote) => {
    try {
      setSelectedQuote(quote);
      await markDelivered(quote.shipment._id);
      setOtpModalOpen(true);
    } catch (err) {
      setSelectedQuote(quote);
      setOtpError("Failed to mark delivered. Please try again.");
      setOtpModalOpen(true);
    }
  };

  const handleTrack = (quote) => {
    if (isCompletedQuote(quote)) return;
    navigate(`/shipper/track/${quote._id}`);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6)
      return setOtpError("Please enter a valid 6-digit OTP");
    try {
      setOtpError("");
      await verifyOtp(selectedQuote.shipment._id, otp);
      setOtpModalOpen(false);
      setOtp("");
      navigate("/shipper/earnings");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "OTP verification failed. Please try again.";
      setOtpError(message);
    }
  };

  const closeModal = () => {
    setOtpModalOpen(false);
    setOtp("");
    setOtpError("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <PageLoader
          text="Loading shipments..."
          fullScreen={false}
          color="#BF9B53"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 font-montserrat">
      {/* ── HEADER ── */}
      <div className="pt-1">
        <h1 className="font-montserrat text-[28px] font-semibold leading-[38px] text-[#111827]">
          My Shipments
        </h1>
        <p className="mt-3 max-w-5xl font-montserrat text-[12px] font-medium leading-[20px] text-[#4B5563]">
          Manage and track all your horse transport shipments in one place. Mark
          deliveries, verify OTPs, and view your complete shipment history.
        </p>
      </div>

      {/* ── TABS ── */}
      <div className="flex min-h-[47px] items-center overflow-x-auto bg-white px-4 scrollbar-hide sm:px-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex min-h-[47px] shrink-0 items-center justify-center gap-2 border-b-2 px-4 font-montserrat text-[12px] font-semibold leading-[20px] transition-colors sm:px-7
        ${
          activeTab === tab.key
            ? "border-[#BF9B53] text-[#BF9B53]"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        }`}
          >
            {tab.icon}

            {/* label control */}
            <span className="whitespace-nowrap">
              {tab.label}
            </span>

            <span
              className={`inline-flex h-4 min-w-4 items-center justify-center rounded-[2px] px-1 text-[10px] font-bold ${
                activeTab === tab.key
                  ? "bg-[#BF9B53]/10 text-[#BF9B53]"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── INFO BANNER ── */}
      <div className="flex items-start gap-3 rounded-[4px] border border-[#D9AF57] bg-[#FFF9EC] px-5 py-4 font-montserrat text-[12px] font-medium leading-[20px] text-[#4B5563]">
        <FiInfo className="mt-1 shrink-0 text-[#BF9B53]" size={17} />
        {currentTab.info}
      </div>

      {/* ── CONTENT ── */}
      {currentTab.data.length === 0 ? (
        <EmptyState
          icon={currentTab.emptyIcon}
          title={currentTab.emptyTitle}
          subtitle={currentTab.emptySubtitle}
        />
      ) : (
        <div className="flex flex-col gap-5">
          {currentTab.data.map((quote) => (
            <QuoteShipmentCard
              key={quote._id}
              quote={quote}
              tabKey={activeTab}
              token={token}
              onMarkDelivered={handleMarkDelivered}
              onTrack={handleTrack}
              deliveryLoading={deliveryLoading}
              selectedQuote={selectedQuote}
            />
          ))}
        </div>
      )}

      {/* ── OTP MODAL ── */}
      {otpModalOpen && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <MdClose size={20} />
            </button>

            <div className="flex justify-center mb-4">
              <div className="p-3 bg-[#BF9B53]/10 rounded-full">
                <FiCheckCircle size={28} className="text-[#BF9B53]" />
              </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-800 text-center mb-1">
              Verify Delivery OTP
            </h2>
            <p className="text-gray-500 text-sm text-center mb-1">
              Delivering to{" "}
              <span className="font-semibold text-gray-700">
                {selectedQuote.shipment?.deliveryLocation}
              </span>
            </p>
            <p className="text-gray-400 text-xs text-center mb-5">
              Ask the horse owner for the 6-digit OTP they received to confirm
              successful delivery.
            </p>

            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val.length <= 6) setOtp(val);
              }}
              placeholder="000000"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center
                text-xl font-bold tracking-[0.4em] focus:outline-none
                focus:ring-2 focus:ring-[#BF9B53]/40 focus:border-[#BF9B53] mb-1"
            />

            <p className="text-xs text-center text-gray-400 mb-2">
              {otp.length}/6 digits entered
            </p>

            {otpError && (
              <p className="text-red-500 text-xs text-center mb-3">
                {otpError}
              </p>
            )}

            <div className="flex gap-3 mt-2">
              <button
                onClick={closeModal}
                className="flex-1 border border-gray-300 text-gray-600 px-4 py-2.5
                  rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={deliveryLoading || otp.length < 6}
                className="flex-1 bg-[#BF9B53] text-white px-4 py-2.5 rounded-xl
                  text-sm font-semibold hover:bg-[#a8863f] disabled:opacity-50 transition"
              >
                {deliveryLoading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AllUpcomingShipments;
