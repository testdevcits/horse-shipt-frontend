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
} from "react-icons/fi";
import { MdClose } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import PageLoader from "../../components/common/PageLoader";
import PublicShipmentCard from "./ShipmentCard";

const hasAssignedVehicle = (quote) => {
  if (!quote?.vehicle) return false;
  if (typeof quote.vehicle === "string") return true;
  return Object.keys(quote.vehicle).length > 0;
};

/* ─────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────*/
const EmptyState = ({ icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50">
    <div className="p-4 bg-[#BF9B53]/10 rounded-full mb-4">{icon}</div>
    <h3 className="text-base font-semibold text-gray-700">{title}</h3>
    <p className="text-gray-400 text-sm mt-1 max-w-xs">{subtitle}</p>
  </div>
);

/* ─────────────────────────────────────────
   SHIPMENT CARD
───────────────────────────────────────────*/
const QuoteShipmentCard = ({
  quote,
  tabKey,
  onMarkDelivered,
  onTrack,
  deliveryLoading,
  selectedQuote,
}) => {
  const isCancelled =
    quote.isCancelled === true || quote.status === "cancelled";
  const isCompleted = tabKey === "completed";
  const isInTransit = tabKey === "in_transit";

  const normalizedShipment = {
    ...(quote.shipment || {}),
    status: isCancelled
      ? "cancelled"
      : isCompleted
      ? "completed"
      : isInTransit
      ? "assigned"
      : quote.shipment?.status || "assigned",
    transportType: quote.transportType || quote.shipment?.transportType,
  };

  const isProcessingThis = deliveryLoading && selectedQuote?._id === quote._id;

  return (
    <div className={isCancelled ? "opacity-75" : ""}>
      <PublicShipmentCard shipment={normalizedShipment} />
      <div className="bg-white border-x border-b border-[#BF9B53] rounded-b-sm px-4 py-3 -mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 text-xs">
          <span className="font-semibold text-gray-500">
            Quote:{" "}
            <span className="text-[#BF9B53]">
              {quote.currency === "USD" ? "$" : quote.currency || "$"}
              {quote.totalPrice || 0}
            </span>
          </span>
          <span className="font-semibold text-gray-500">
            Payment:{" "}
            <span className="text-gray-800">{quote.paymentStatus || "N/A"}</span>
          </span>
          <span className="font-semibold text-gray-500">
            Trip:{" "}
            <span className="text-gray-800">{quote.tripStatus || "Not started"}</span>
          </span>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {quote.shipperContract?.url && (
            <button
              onClick={() =>
                window.open(
                  quote.shipperContract.url,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              className="flex items-center gap-2 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
            >
              Contract
            </button>
          )}

          {!isCancelled && !isCompleted && (
            <button
              onClick={() => onTrack(quote)}
              className="flex items-center gap-2 border border-[#BF9B53] text-[#BF9B53] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#BF9B53]/5 transition"
            >
              <FiNavigation size={14} />
              Track
            </button>
          )}

          {tabKey === "upcoming" && !isCancelled && !isCompleted && (
            <button
              className="flex items-center gap-2 bg-[#BF9B53] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#a8863f] disabled:opacity-50 transition"
              disabled={isProcessingThis}
              onClick={() => onMarkDelivered(quote)}
            >
              <FiTruck size={14} />
              {isProcessingThis ? "Processing..." : "Mark Delivered"}
            </button>
          )}

          {isCompleted && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 text-sm font-semibold">
              <FiCheckCircle size={14} />
              Delivery Verified
            </div>
          )}

          {isCancelled && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-red-500 text-sm font-semibold">
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
    if (quote.shipment?.status === "delivered") return false;

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
    if (q.shipment?.status === "delivered") return false;
    if (isInTransitQuote(q)) return false;
    return q.status === "accepted";
  });

  const completedShipments = quotes.filter((q) => {
    if (q.isCancelled === true || q.status === "cancelled") return false;
    return q.shipment?.status === "delivered";
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
    if (quote.shipment?.status === "delivered") return;
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
    <div className="flex flex-col font-[Montserrat] gap-6">
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
          My Shipments
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage and track all your horse transport shipments in one place. Mark
          deliveries, verify OTPs, and view your complete shipment history.
        </p>
      </div>

      {/* ── TABS ── */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors -mb-px
        ${
          activeTab === tab.key
            ? "border-[#BF9B53] text-[#BF9B53]"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        }`}
          >
            {tab.icon}

            {/* label control */}
            <span className="truncate max-w-[70px] sm:max-w-none">
              {tab.label}
            </span>

            {tab.count > 0 && (
              <span
                className={`text-[10px] sm:text-xs px-1 py-0.5 rounded-full font-bold
            ${
              activeTab === tab.key
                ? "bg-[#BF9B53]/15 text-[#BF9B53]"
                : "bg-gray-100 text-gray-500"
            }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── INFO BANNER ── */}
      <div className="bg-[#BF9B53]/5 border border-[#BF9B53]/15 rounded-xl px-4 py-3 text-sm text-gray-600">
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
        <div className="flex flex-col gap-4">
          {currentTab.data.map((quote) => (
            <QuoteShipmentCard
              key={quote._id}
              quote={quote}
              tabKey={activeTab}
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

      <button
        onClick={() => navigate(-1)}
        className="fixed bottom-6 right-6 bg-gray-600 text-white p-3 rounded-full shadow-lg hover:bg-[#BF9B53] transition"
      >
        <IoArrowBack className="w-5 h-5" />
      </button>
    </div>
  );
};

export default AllUpcomingShipments;
