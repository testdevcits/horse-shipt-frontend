import React, { useEffect, useState } from "react";
import { useShipperQuote } from "../../contexts/shipperContext/ShipperQuoteContext";
import { useShipperDelivery } from "../../contexts/shipperContext/ShipperDeliveryContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiTruck,
  FiMapPin,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiHash,
  FiUsers,
  FiAlertCircle,
  FiNavigation,
  FiStar,
} from "react-icons/fi";
import { MdClose } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import PageLoader from "../../components/common/PageLoader";
import Toast from "../../components/common/Toast";

const API_BASE_URL = "https://horse-shipt.vercel.app/api";

const hasAssignedVehicle = (quote) => {
  if (!quote?.vehicle) return false;
  if (typeof quote.vehicle === "string") return true;
  return Object.keys(quote.vehicle).length > 0;
};

/* ─────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────*/
const StatusBadge = ({ state }) => {
  const map = {
    accepted: {
      label: "Accepted",
      icon: <FiCheckCircle size={11} />,
      cls: "bg-green-50 text-green-700 border-green-200",
    },
    in_transit: {
      label: "In Transit",
      icon: <FiTruck size={11} />,
      cls: "bg-blue-50 text-blue-700 border-blue-200",
    },
    completed: {
      label: "Delivered & Verified",
      icon: <FiCheckCircle size={11} />,
      cls: "bg-blue-50 text-blue-700 border-blue-200",
    },
    cancelled: {
      label: "Cancelled",
      icon: <FiXCircle size={11} />,
      cls: "bg-red-50 text-red-600 border-red-200",
    },
    pending: {
      label: "Pending",
      icon: <FiClock size={11} />,
      cls: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
  };
  const cfg = map[state] || map.pending;
  return (
    <span
      className={`inline-flex h-[34px] items-center gap-1.5 rounded-[4px] border border-[#047857] px-3 font-montserrat text-[10px] leading-[18px] sm:text-[12px] sm:leading-[20px] font-semibold uppercase tracking-[0%] ${cfg.cls}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
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

const CustomerReviewModal = ({ quote, open, onClose, onSubmit, submitting }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    if (open) {
      setRating(0);
      setReviewText("");
    }
  }, [open]);

  if (!open || !quote) return null;

  const customer = quote.shipment?.customer;

  const handleSubmit = () => {
    if (!rating) {
      Toast.error("Please select a rating");
      return;
    }

    onSubmit({ rating, reviewText });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white  rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <MdClose size={20} />
        </button>

        <div className="flex justify-center mb-4">
          <div className="p-3 bg-[#BF9B53]/10 rounded-full">
            <FiStar size={28} className="text-[#BF9B53]" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-800 text-center">
          Review Customer for Shipment
        </h3>
        <p className="mt-1 text-center text-xs font-semibold text-[#735D32]">
          Shipment: {quote.shipment?.shipmentCode || "N/A"}
        </p>
        <p className="mt-1 text-center text-[11px] text-gray-500">
          This review is saved only for this completed shipment.
        </p>

        <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
          <p className="font-semibold text-gray-800">
            {customer?.name || "Customer"}
          </p>
          <p className="text-xs text-gray-500">{customer?.email}</p>
        </div>

        <div className="mt-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Your Rating
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-3xl leading-none ${star <= rating ? "text-yellow-500" : "text-gray-300"
                  }`}
                aria-label={`${star} star rating`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Write your experience with this customer..."
          className="w-full border rounded-lg p-2 text-sm mt-4 focus:outline-none focus:ring-2 focus:ring-system-primary"
          rows={3}
        />

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg"
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-sm bg-system-primary text-white rounded-lg disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   SHIPMENT CARD
───────────────────────────────────────────*/
const ShipmentCard = ({
  quote,
  tabKey,
  onMarkDelivered,
  onTrack,
  onReviewCustomer,
  alreadyReviewedCustomer,
  deliveryLoading,
  selectedQuote,
}) => {
  const isCancelled =
    quote.isCancelled === true || quote.status === "cancelled";
  const isCompleted = tabKey === "completed";
  const isInTransit = tabKey === "in_transit";
  // const isUpcoming = tabKey === "upcoming";
  // const isProcessingThis =
  //   deliveryLoading && selectedQuote?.shipment?._id === quote.shipment?._id;

  const badgeState = isCancelled
    ? "cancelled"
    : isCompleted
      ? "completed"
      : isInTransit
        ? "in_transit"
        : "accepted";
  const priceLabel =
    quote.totalPrice !== undefined && quote.totalPrice !== null
      ? `${quote.currency === "USD" ? "$" : quote.currency || "$"}${quote.totalPrice}`
      : "$0";

  return (
    <div
      className={`bg-white px-5 py-5 transition sm:px-6 lg:px-7
      ${isCancelled
          ? "opacity-75"
          : ""
        }`}
    >
      {/* ── TOP ROW: Code + Badges ── */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-1.5 font-montserrat text-[11px] leading-[18px] sm:text-[12px] sm:leading-[20px] font-medium tracking-[0%] text-[#6B7280]">
          <FiHash size={12} />
          <span>{quote.shipment?.shipmentCode || quote._id}</span>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <StatusBadge state={badgeState} />
          <span
            className={`inline-flex h-[34px] items-center rounded-[4px] border px-3 font-montserrat text-[10px] leading-[18px] sm:text-[12px] sm:leading-[20px] font-semibold uppercase tracking-[0%]
  ${quote.paymentStatus === "paid"
                ? "border-[#047857] bg-emerald-50 text-[#047857]"
                : "border-[#BF9B53] bg-[#BF9B53]/5 text-[#735D32]"
              }`}
          >
            Payment: {quote.paymentStatus}
          </span>
        </div>
      </div>

      {/* ── ROUTE ── */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="space-y-3">
          <div className="flex h-[44px] items-center gap-2 font-montserrat text-[11px] leading-[18px] sm:text-[12px] sm:leading-[20px] font-semibold tracking-[0%] text-[#4B5563]">
            <FiMapPin size={14} className="shrink-0 text-[#BF9B53]" />

            <span className="font-montserrat text-[12px] leading-[18px] sm:text-[14px] sm:leading-[20px] font-semibold tracking-[0%] text-[#4B5563]">
              {quote.shipment?.pickupLocation || "Pickup location"}
            </span>
          </div>
          <div className=" flex items-center gap-2 font-montserrat text-[12px] font-medium leading-[20px] text-[#4B5563]">
            <FiUsers size={12} />
            <span className="font-montserrat text-[11px] leading-[18px] sm:text-[12px] sm:leading-[20px] font-semibold tracking-[0%] text-[#6B7280]">
              {quote.shipment?.numberOfHorses || 1} Horse
              {(quote.shipment?.numberOfHorses || 1) !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 font-montserrat text-[12px] font-medium leading-[20px] text-[#4B5563]">
            <span className="font-bold text-[#111827]">{priceLabel}</span>
            <span className="text-[#6B7280]">
              · {quote.paymentMethod || "card"} · due on{" "}
              {quote.paymentDue || "delivery"}
            </span>
          </div>
        </div>

        <div className="relative flex h-[44px] w-full max-w-[720px] items-center justify-center justify-self-center bg-[#F3F4F6]">
          <span className="absolute left-4 right-4 top-1/2 h-px -translate-y-1/2 bg-[#BF9B53]" />
          <span className="absolute left-4 top-1/2 h-[6px] w-[6px] -translate-y-1/2 rounded-full bg-[#BF9B53]" />
          <span className="absolute right-4 top-1/2 h-[6px] w-[6px] -translate-y-1/2 rounded-full bg-[#BF9B53]" />
          <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#735D32] shadow-sm">
            <FiTruck size={18} />
          </span>
        </div>

        <div className="flex h-[44px] items-center gap-2 font-montserrat text-[12px] font-semibold leading-[20px] text-[#4B5563] lg:justify-end lg:text-right">
          <FiMapPin size={14} className="shrink-0 text-emerald-500" />
          <span className="font-montserrat text-[12px] leading-[18px] sm:text-[14px] sm:leading-[20px] font-semibold tracking-[0%] text-[#4B5563]">
            {quote.shipment?.deliveryLocation || "Delivery location"}
          </span>
        </div>
      </div>

      {/* ── CANCEL REASON ── */}
      {isCancelled && quote.cancelReason && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-xs text-red-500">
          <FiAlertCircle size={13} className="mt-0.5 shrink-0" />
          <span>Cancellation reason: {quote.cancelReason}</span>
        </div>
      )}

      {/* ── ACTIONS ── */}
      <div className="mt-5 flex flex-wrap gap-3">
        {/* Track only active/upcoming shipments. Completed shipments keep details only. */}
        {quote.shipperContract?.url && (
          <button
            onClick={() =>
              window.open(
                quote.shipperContract.url,
                "_blank",
                "noopener,noreferrer"
              )
            }
            className="h-[34px] min-w-[130px] rounded-[4px] bg-[#BF9B53] px-4 font-montserrat text-[12px] font-bold uppercase text-white transition hover:bg-tabActive"
          >
            View Contract
          </button>
        )}

        {!isCancelled && !isCompleted && (
          <button
            onClick={() => onTrack(quote)}
            className="flex h-[34px] min-w-[130px] items-center justify-center gap-2 rounded-[4px] border border-[#BF9B53] px-4 font-montserrat text-[12px] font-bold uppercase text-[#BF9B53] transition hover:bg-[#BF9B53]/5"
          >
            Track Shipment
          </button>
        )}

        {/* Mark Delivered — only upcoming tab */}
        {/* {isUpcoming && (
          <button
            className="flex items-center gap-2 bg-[#BF9B53] text-white
              px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#a8863f]
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isProcessingThis}
            onClick={() => onMarkDelivered(quote)}
          >
            <FiTruck size={14} />
            {isProcessingThis ? "Processing..." : "Mark Delivered"}
          </button>
        )} */}

        {/* Completed pill */}
        {isCompleted && (
          <>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 text-sm font-semibold">
              <FiCheckCircle size={14} />
              Delivery Verified
            </div>
            {alreadyReviewedCustomer ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
                <FiStar size={14} />
                Customer Reviewed
              </div>
            ) : (
              <button
                onClick={() => onReviewCustomer(quote)}
                className="flex items-center gap-2 border border-[#BF9B53] text-[#BF9B53]
                  px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#BF9B53]/5 transition"
              >
                <FiStar size={14} />
                Review Customer
              </button>
            )}
          </>
        )}

        {/* Cancelled pill */}
        {isCancelled && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-500 text-sm font-semibold">
            <FiXCircle size={14} />
            Shipment Cancelled
          </div>
        )}
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
  const { token } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [reviewQuote, setReviewQuote] = useState(null);
  const [myCustomerReviews, setMyCustomerReviews] = useState([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    getMyQuotes();
  }, [getMyQuotes]);

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${API_BASE_URL}/shipper/customer-reviews/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMyCustomerReviews(res.data?.data || []))
      .catch(() => setMyCustomerReviews([]));
  }, [token]);

  const normalizeId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return (value._id || value.id || "").toString();
  };

  const hasReviewedCustomer = (quote) =>
    myCustomerReviews.some(
      (review) => normalizeId(review.shipmentId) === normalizeId(quote.shipment)
    );

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
          <span className="font-montserrat text-[14px] font-bold leading-[24px] tracking-[0%] text-[#BF9B53]">
            Upcoming shipments
          </span>{" "}
          <span className="font-montserrat text-[12px] leading-[20px] sm:text-[13px] sm:leading-[22px] lg:text-[14px] lg:leading-[24px] font-semibold tracking-[0%] text-[#4B5563]">
            — These are shipments where your quote has been accepted by the horse
            owner and you are scheduled to pick up and deliver the horses. Once
            you complete delivery, click{" "} "Mark Delivered"and enter the OTP provided by the horse owner to confirm delivery.
          </span>
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

  const handleCustomerReviewSubmit = async ({ rating, reviewText }) => {
    if (!reviewQuote?.shipment?.customer?._id) {
      Toast.error("Customer details are missing for this shipment");
      return;
    }

    setReviewSubmitting(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/shipper/customer-reviews`,
        {
          customerId: reviewQuote.shipment.customer._id,
          shipmentId: reviewQuote.shipment._id,
          rating,
          reviewText,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMyCustomerReviews((prev) => [...prev, res.data?.data]);
      setReviewQuote(null);
      Toast.success("Customer review submitted successfully");
    } catch (err) {
      Toast.error(
        err.response?.data?.message || "Failed to submit customer review"
      );
    } finally {
      setReviewSubmitting(false);
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
        <h1 className="font-montserrat text-[28px] leading-[38px] sm:text-[32px] sm:leading-[44px] lg:text-[36px] lg:leading-[50px] font-semibold tracking-[0%] text-[#111827]">
          My Shipments
        </h1>
        <p className="mt-1 font-montserrat text-[12px] leading-[20px] sm:text-[13px] sm:leading-[22px] lg:text-[14px] lg:leading-[24px] font-medium tracking-[0%] text-[#4B5563]">
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
        ${activeTab === tab.key
                ? "border-[#BF9B53] text-[#BF9B53]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            {tab.icon}

            {/* label control */}
            <span
              className={`truncate max-w-[70px] sm:max-w-none font-montserrat text-[12px] leading-[18px] sm:text-[14px] sm:leading-[20px] font-semibold tracking-[0%] ${activeTab === tab.key
                ? "text-[#BF9B53]"
                : "text-[#6B7280]"
                }`}
            >
              {tab.label}
            </span>

            {tab.count > 0 && (
              <span
                className={`text-[10px] sm:text-xs px-1 py-0.5 rounded-full font-bold
            ${activeTab === tab.key
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
      <div className="rounded-[5px] border border-[#BF9B53] bg-[#BF9B53]/5 px-3 py-3 sm:px-4 sm:py-4 text-[12px] leading-[20px] sm:text-[14px] sm:leading-[24px] font-montserrat font-medium tracking-[0%] text-gray-600">
        {currentTab.info}
      </div>

      {/* ── CONTENT ── */}
      <CustomerReviewModal
        open={Boolean(reviewQuote)}
        quote={reviewQuote}
        onClose={() => setReviewQuote(null)}
        onSubmit={handleCustomerReviewSubmit}
        submitting={reviewSubmitting}
      />

      {currentTab.data.length === 0 ? (
        <EmptyState
          icon={currentTab.emptyIcon}
          title={currentTab.emptyTitle}
          subtitle={currentTab.emptySubtitle}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {currentTab.data.map((quote) => (
            <ShipmentCard
              key={quote._id}
              quote={quote}
              tabKey={activeTab}
              onMarkDelivered={handleMarkDelivered}
              onTrack={handleTrack}
              onReviewCustomer={setReviewQuote}
              alreadyReviewedCustomer={hasReviewedCustomer(quote)}
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
