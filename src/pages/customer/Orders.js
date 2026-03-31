import React, { useEffect, useState } from "react";
import { useDeliveredShipments } from "../../contexts/customerContext/DeliveredShipmentContext";
import PageLoader from "../../components/common/PageLoader";
import ReviewModal from "./common/ReviewModal";
import { useReview } from "../../contexts/customerContext/ReviewContext";
import Toast from "../../components/common/Toast";
import { LiaHorseHeadSolid } from "react-icons/lia";

/* ─────────────────────────────────────────
   StatusChip — handles all statuses
───────────────────────────────────────── */
const StatusChip = ({ status }) => {
  switch (status) {
    case "delivered":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-[#BF9B53] text-white">
          <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
          Delivered
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-red-100 text-red-600">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          Cancelled
        </span>
      );
    case "assigned":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-700">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
          In Progress
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-yellow-100 text-yellow-700">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
          Pending
        </span>
      );
  }
};

/* ─────────────────────────────────────────
   HorseCard (inside drawer)
───────────────────────────────────────── */
const HorseCard = ({ horse, idx }) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 mb-3 font-montserrat">
    {horse.photo?.url && (
      <div className="relative">
        <img
          src={horse.photo.url}
          alt={horse.registeredName}
          className="w-full h-48 object-cover"
        />
        <span className="absolute top-2 left-2 bg-black/55 text-white text-xs font-bold px-2 py-0.5 rounded">
          Horse #{idx + 1}
        </span>
      </div>
    )}
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-bold text-gray-900 text-sm">
          {horse.registeredName}{" "}
          <span className="font-normal text-gray-500">({horse.barnName})</span>
        </p>
        <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
          {horse.sex}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {[
          horse.breed,
          `${horse.age} yrs`,
          horse.colour,
          horse.requestedStallSize,
        ].map((tag, i) => (
          <span
            key={i}
            className="text-xs bg-white border border-gray-200 text-gray-600 font-medium px-2 py-0.5 rounded"
          >
            {tag}
          </span>
        ))}
      </div>

      {horse.generalInfo && (
        <p className="text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-2 mb-3 leading-relaxed">
          💬 {horse.generalInfo}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {horse.documents?.coggins?.url && (
          <a
            href={horse.documents.coggins.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg no-underline hover:bg-blue-100 transition-colors"
          >
            📄 Coggins
          </a>
        )}
        {horse.documents?.healthCertificate?.url && (
          <a
            href={horse.documents.healthCertificate.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg no-underline hover:bg-blue-100 transition-colors"
          >
            📋 Health Cert
          </a>
        )}
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   Full-Screen Side Drawer
───────────────────────────────────────── */
const ShipmentDrawer = ({ shipment, onClose, onReview, alreadyReviewed }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (shipment) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [shipment]);

  const close = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  if (!shipment) return null;

  const isDelivered = shipment.status === "delivered";
  const isCancelled = shipment.status === "cancelled";

  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  const fmtFull = (d) =>
    d
      ? new Date(d).toLocaleString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  /* icon bg color by status */
  const iconBg = isDelivered
    ? "bg-[#BF9B53]"
    : isCancelled
    ? "bg-red-100"
    : "bg-blue-100";

  const iconColor = isDelivered
    ? "text-white"
    : isCancelled
    ? "text-red-500"
    : "text-blue-600";

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-montserrat">
      {/* Backdrop */}
      <div
        onClick={close}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <div
        className={`relative z-10 w-full max-w-2xl h-full bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Sticky Header ── */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-md flex items-center justify-center text-xl shrink-0 ${iconBg} ${iconColor}`}
          >
            <LiaHorseHeadSolid />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Shipment Detail
            </p>
            <h2 className="text-base font-extrabold text-gray-900 font-mono tracking-wide truncate">
              {shipment.shipmentCode}
            </h2>
          </div>
          <StatusChip status={shipment.status} />
          <button
            onClick={close}
            className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors shrink-0 text-base"
          >
            ✕
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 vehicle-scroll">
          {/* Cancelled Banner */}
          {isCancelled && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-red-500 text-lg">🚫</span>
              <div>
                <p className="text-sm font-bold text-red-700">
                  Shipment Cancelled
                </p>
                <p className="text-xs text-red-500">
                  This shipment was cancelled and will not be processed.
                </p>
              </div>
            </div>
          )}

          {/* Route */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Route
            </p>
            <div className="flex gap-4">
              <div className="flex flex-col items-center pt-1">
                <span className="w-3 h-3 rounded-sm bg-green-500 ring-2 ring-white ring-offset-1 ring-offset-green-500 shrink-0" />
                <div className="w-0.5 flex-1 min-h-6 my-1 border-l-2 border-dashed border-gray-300" />
                <span className="w-3 h-3 rounded-sm bg-red-500 ring-2 ring-white ring-offset-1 ring-offset-red-500 shrink-0" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Pickup
                </p>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  {shipment.pickupLocation}
                </p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Delivery
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {shipment.deliveryLocation}
                </p>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: "📅",
                label: "Pickup Date",
                value: fmt(shipment.pickupDate),
              },
              {
                icon: "🏁",
                label: isDelivered ? "Delivered At" : "Delivery Date",
                value: isDelivered
                  ? fmtFull(shipment.deliveredAt)
                  : fmt(shipment.deliveryDate),
              },
              {
                icon: "🐎",
                label: "Horses",
                value: `${shipment.numberOfHorses} Horse${
                  shipment.numberOfHorses > 1 ? "s" : ""
                }`,
              },
              {
                icon: "💳",
                label: "Payment",
                value: shipment.paymentStatus,
                highlight:
                  shipment.paymentStatus === "paid"
                    ? "text-green-600"
                    : "text-yellow-600",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-gray-50 border border-gray-200 rounded-md p-3"
              >
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {item.icon} {item.label}
                </p>
                <p
                  className={`text-sm font-bold text-gray-900 capitalize ${
                    item.highlight || ""
                  }`}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Shipper — show only if assigned */}
          {shipment.shipper ? (
            <div className="border border-gray-200 rounded-md p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#BF9B53]/10 border-2 border-[#BF9B53]/30 flex items-center justify-center text-lg font-extrabold text-[#BF9B53] shrink-0">
                {shipment.shipper.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm">
                  {shipment.shipper.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {shipment.shipper.email}
                </p>
              </div>
              <span className="text-xs font-bold uppercase tracking-wide bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-lg shrink-0">
                Shipper
              </span>
            </div>
          ) : (
            <div className="border border-dashed border-gray-200 rounded-md p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                👤
              </div>
              <p className="text-sm text-gray-400 italic">
                No shipper assigned yet
              </p>
            </div>
          )}

          {/* Horses */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Horse Details ({shipment.numberOfHorses})
            </p>
            {shipment.horses.map((h, i) => (
              <HorseCard key={i} horse={h} idx={i} />
            ))}
          </div>

          {/* Additional Info */}
          {shipment.additionalInfo && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-1">
                Additional Info
              </p>
              <p className="text-sm text-yellow-900">
                {shipment.additionalInfo}
              </p>
            </div>
          )}
        </div>

        {/* ── Sticky Footer ── */}
        <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4 flex gap-3">
          <button
            onClick={close}
            className="px-5 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Close
          </button>

          {/* Only show Rate button for delivered shipments */}
          {isDelivered && (
            <button
              onClick={() => {
                if (!alreadyReviewed) onReview();
              }}
              disabled={alreadyReviewed}
              className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                alreadyReviewed
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                  : "bg-[#BF9B53] hover:bg-[#a8863e] text-white cursor-pointer"
              }`}
            >
              {alreadyReviewed ? "Already Reviewed" : "Rate This Shipper"}
            </button>
          )}

          {/* Cancelled shipment — no action */}
          {isCancelled && (
            <div className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-red-50 text-red-400 border border-red-200 cursor-not-allowed">
              🚫 Shipment Cancelled
            </div>
          )}

          {/* In-progress / pending shipment */}
          {!isDelivered && !isCancelled && (
            <div className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-blue-50 text-blue-500 border border-blue-200 cursor-not-allowed">
              🚚 Shipment In Progress
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Shipment Row Card
───────────────────────────────────────── */
const ShipmentRow = ({ s, onView }) => {
  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  const isDelivered = s.status === "delivered";
  const isCancelled = s.status === "cancelled";

  const iconBg = isDelivered
    ? "bg-[#BF9B53]"
    : isCancelled
    ? "bg-red-100"
    : "bg-blue-100";

  const iconColor = isDelivered
    ? "text-white"
    : isCancelled
    ? "text-red-500"
    : "text-blue-600";

  const hoverBorder = isCancelled
    ? "hover:border-red-300"
    : isDelivered
    ? "hover:border-[#BF9B53]"
    : "hover:border-blue-300";

  return (
    <div
      className={`bg-white font-montserrat border border-gray-200 rounded-md px-5 py-4 flex items-center gap-4 ${hoverBorder} hover:shadow-md transition-all duration-200 w-full`}
    >
      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${iconBg} ${iconColor}`}
      >
        <LiaHorseHeadSolid />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-extrabold text-sm text-gray-900 font-mono tracking-wide">
            {s.shipmentCode}
          </span>
          <StatusChip status={s.status} />
        </div>
        <p className="text-sm text-gray-500 truncate mb-1.5">
          📍 {s.pickupLocation} &nbsp;→&nbsp; {s.deliveryLocation}
        </p>
        <div className="flex flex-wrap gap-3">
          <span className="text-xs text-gray-400">🗓 {fmt(s.pickupDate)}</span>
          <span className="text-xs text-gray-400">
            🐎 {s.numberOfHorses} horse{s.numberOfHorses > 1 ? "s" : ""}
          </span>
          {s.shipper?.name && (
            <span className="text-xs text-gray-400">👤 {s.shipper.name}</span>
          )}
        </div>
      </div>

      {/* View Button */}
      <button
        onClick={() => onView(s)}
        className="shrink-0 px-5 py-2.5 bg-[#BF9B53] hover:bg-[#a8863e] text-white text-sm font-bold rounded-lg transition-colors whitespace-nowrap"
      >
        View
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────
   Main Page
───────────────────────────────────────── */
const AllShipments = () => {
  const { shipments, loading, fetchCompletedShipments } =
    useDeliveredShipments();
  const { addReview, myReviews } = useReview();

  const [selected, setSelected] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState("completed");

  useEffect(() => {
    fetchCompletedShipments();
  }, [fetchCompletedShipments]);

  const handleReviewSubmit = async (data) => {
    if (!selected) return;
    try {
      const res = await addReview({
        shipperId: selected.shipper._id,
        shipmentId: selected._id,
        rating: data.rating,
        reviewText: data.reviewText,
      });
      if (res?.success)
        setToast({
          message: "Review submitted successfully!",
          type: "success",
        });
    } catch (err) {
      setToast({
        message: err.message || "Failed to submit review",
        type: "error",
      });
    } finally {
      setReviewOpen(false);
    }
  };

  const hasReviewed = (id) => myReviews.some((r) => r.shipmentId === id);

  if (loading)
    return <PageLoader text="Loading shipments..." fullScreen={false} />;

  const completed = shipments.filter((s) => s.status === "delivered");
  const active = shipments.filter(
    (s) => s.status !== "delivered" && s.status !== "cancelled"
  );
  const cancelled = shipments.filter((s) => s.status === "cancelled");

  const tabMap = {
    completed,
    active,
    cancelled,
  };

  const shown = tabMap[tab] || [];

  const TABS = [
    { key: "completed", label: "Completed", count: completed.length },
    { key: "active", label: "Active", count: active.length },
    { key: "cancelled", label: "Cancelled", count: cancelled.length },
  ];

  const activeTabColor = {
    completed: "border-[#BF9B53] text-[#BF9B53]",
    active: "border-blue-600 text-blue-600",
    cancelled: "border-red-500 text-red-500",
  };

  const activeBadgeColor = {
    completed: "bg-[#BF9B53] text-white",
    active: "bg-blue-600 text-white",
    cancelled: "bg-red-500 text-white",
  };

  const emptyIcon = {
    completed: "📭",
    active: "🚚",
    cancelled: "🚫",
  };

  const emptyMsg = {
    completed: "No completed shipments yet.",
    active: "No active shipments at the moment.",
    cancelled: "No cancelled shipments.",
  };

  return (
    <div className="w-full min-h-screen font-montserrat">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Review Modal */}
      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        shipment={selected}
        onSubmit={handleReviewSubmit}
      />

      {/* Drawer */}
      {selected && (
        <ShipmentDrawer
          shipment={selected}
          onClose={() => setSelected(null)}
          onReview={() => setReviewOpen(true)}
          alreadyReviewed={hasReviewed(selected._id)}
        />
      )}

      {/* ── Page Content ── */}
      <div className="w-full pb-5">
        {/* Page Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              My Shipments
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track all your horse transport requests
            </p>
          </div>

          {/* Stat Pills */}
          <div className="flex gap-3 flex-wrap">
            <div className="bg-[#BF9B53] rounded-xl px-4 py-2.5 text-center min-w-16">
              <p className="text-xl font-extrabold text-white leading-none">
                {shipments.length}
              </p>
              <p className="text-xs text-white font-medium mt-1">Total</p>
            </div>
            <div className="bg-green-50 rounded-xl px-4 py-2.5 text-center min-w-16">
              <p className="text-xl font-extrabold text-green-600 leading-none">
                {completed.length}
              </p>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Delivered
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl px-4 py-2.5 text-center min-w-16">
              <p className="text-xl font-extrabold text-blue-600 leading-none">
                {active.length}
              </p>
              <p className="text-xs text-gray-500 font-medium mt-1">Active</p>
            </div>
            <div className="bg-red-50 rounded-xl px-4 py-2.5 text-center min-w-16">
              <p className="text-xl font-extrabold text-red-500 leading-none">
                {cancelled.length}
              </p>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Cancelled
              </p>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b-2 border-gray-200 mb-5 overflow-x-auto">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2  transition-colors duration-150 bg-transparent whitespace-nowrap
                  ${
                    active
                      ? activeTabColor[t.key]
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                {t.label}
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full leading-none ${
                    active
                      ? activeBadgeColor[t.key]
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── List ── */}
        {shown.length === 0 ? (
          <div className="text-center py-20 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="text-5xl mb-4">{emptyIcon[tab]}</div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              {tab === "completed"
                ? "No Completed Shipments"
                : tab === "active"
                ? "No Active Shipments"
                : "No Cancelled Shipments"}
            </h2>
            <p className="text-sm text-gray-400">{emptyMsg[tab]}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {shown.map((s) => (
              <ShipmentRow key={s._id} s={s} onView={setSelected} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllShipments;
