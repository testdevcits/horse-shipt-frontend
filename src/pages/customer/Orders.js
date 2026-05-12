import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDeliveredShipments } from "../../contexts/customerContext/DeliveredShipmentContext";
import { useCustomerShipments } from "../../contexts/customerContext/CustomerShipmentContext";
import PageLoader from "../../components/common/PageLoader";
import ReviewModal from "./common/ReviewModal";
import { useReview } from "../../contexts/customerContext/ReviewContext";
import Toast from "../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import { createShipmentQueryToken } from "../../utils/createQueryToken";
import { LiaHorseHeadSolid } from "react-icons/lia";
import {
  FiTrash2,
  FiShare2,
  FiEye,
  FiEdit2,
  FiNavigation,
} from "react-icons/fi";

/* ─────────────────────────────────────────
   StatusChip
───────────────────────────────────────── */
const StatusChip = ({ status }) => {
  switch (status) {
    case "delivered":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase bg-[#BF9B53] text-white">
          <span className="w-1 h-1 rounded-full bg-white shrink-0" />
          Delivered
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase bg-red-100 text-red-600">
          <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
          Cancelled
        </span>
      );
    case "assigned":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase bg-blue-100 text-blue-700">
          <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0" />
          Assigned
        </span>
      );
    case "open_for_offers":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase bg-purple-100 text-purple-700">
          <span className="w-1 h-1 rounded-full bg-purple-500 shrink-0" />
          Open
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase bg-gray-100 text-gray-700">
          <span className="w-1 h-1 rounded-full bg-gray-500 shrink-0" />
          Draft
        </span>
      );
  }
};

/* ─────────────────────────────────────────
   HorseCard
───────────────────────────────────────── */
const HorseCard = ({ horse, idx }) => {
  const openDoc = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm mb-3">
      {/* Image — taller and full width */}
      {horse.photo?.url ? (
        <div className="relative">
          <img
            src={horse.photo.url}
            alt={horse.registeredName}
            className="w-full h-48 sm:h-56 object-cover"
          />
          <span className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            Horse #{idx + 1}
          </span>
        </div>
      ) : (
        <div className="w-full h-28 bg-gray-100 flex items-center justify-center text-gray-300 text-5xl">
          <LiaHorseHeadSolid />
        </div>
      )}

      <div className="p-3 sm:p-4">
        {/* Name + Sex row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">
              {horse.registeredName}
            </p>
            {horse.barnName && (
              <p className="text-xs text-gray-500 mt-0.5">
                Barn: {horse.barnName}
              </p>
            )}
          </div>
          <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded-full shrink-0">
            {horse.sex}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[
            horse.breed,
            horse.age ? `${horse.age} yrs` : null,
            horse.colour,
            horse.requestedStallSize,
          ]
            .filter(Boolean)
            .map((tag, i) => (
              <span
                key={i}
                className="text-xs bg-gray-50 border border-gray-200 text-gray-600 font-medium px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
        </div>

        {/* General Info */}
        {horse.generalInfo && (
          <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mb-3 leading-relaxed">
            {horse.generalInfo}
          </p>
        )}

        {/* Documents — open in new tab via window.open */}
        {(horse.documents?.coggins?.url ||
          horse.documents?.healthCertificate?.url) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            <p className="w-full text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Documents
            </p>
            {horse.documents?.coggins?.url && (
              <button
                onClick={() => openDoc(horse.documents.coggins.url)}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
              >
                📄 Coggins
              </button>
            )}
            {horse.documents?.healthCertificate?.url && (
              <button
                onClick={() => openDoc(horse.documents.healthCertificate.url)}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
              >
                📋 Health Cert
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   ShipmentDrawer
───────────────────────────────────────── */
const ShipmentDrawer = ({
  shipment,
  onClose,
  onReview,
  alreadyReviewed,
  isDraft = false,
  onPublish,
  onDelete,
  isInProgress = false,
  onNavigate,
  onEdit,
  onMetadataEdit,
  onTrack,
}) => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
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

  const getPickupDisplay = () => {
    const start = shipment.pickupDateRange?.start;
    const end = shipment.pickupDateRange?.end;
    if (start && end) {
      const s = fmt(start);
      const e = fmt(end);
      return s === e ? s : `${s} – ${e}`;
    }
    return fmt(shipment.pickupDate);
  };

  const getDeliveryDisplay = () => {
    if (isDelivered) return fmtFull(shipment.deliveredAt);
    const start = shipment.deliveryDateRange?.start;
    const end = shipment.deliveryDateRange?.end;
    if (start && end) {
      const s = fmt(start);
      const e = fmt(end);
      return s === e ? s : `${s} - ${e}`;
    }
    return fmt(shipment.deliveryDate);
  };

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
    <div className="fixed inset-0 z-40 flex justify-end font-montserrat">
      {/* Backdrop */}
      <div
        onClick={close}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <div
        className={`relative z-50 w-full max-w-2xl h-full bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2">
          <div
            className={`w-10 h-10 rounded-md flex items-center justify-center text-xl shrink-0 ${iconBg} ${iconColor}`}
          >
            <LiaHorseHeadSolid />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Shipment Detail
            </p>
            <h2 className="text-sm font-bold text-gray-900 font-mono tracking-wide truncate">
              {shipment.shipmentCode}
            </h2>
          </div>
          <StatusChip status={shipment.status} />
          <button
            onClick={close}
            className="w-8 h-8 rounded-sm border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100  hover:text-[#BF9B53] transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 vehicle-scroll">
          {isCancelled && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
              <span className="text-red-500">🚫</span>
              <div>
                <p className="text-xs font-bold text-red-700">
                  Shipment Cancelled
                </p>
                <p className="text-xs text-red-500">
                  This shipment was cancelled and will not be processed.
                </p>
              </div>
            </div>
          )}

          {/* Route */}
          <div className="bg-gray-50 border border-gray-200 rounded-sm p-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Route
            </p>
            <div className="flex gap-3">
              <div className="flex flex-col items-center pt-1">
                <span className="w-2 h-2 rounded-sm bg-[#BF9B53] ring-2 ring-white ring-offset-1 ring-offset-[#BF9B53] shrink-0" />
                <div className="w-0.5 flex-1 min-h-4 my-0.5 border-l-2 border-dashed border-gray-300" />
                <span className="w-2 h-2 rounded-sm bg-[#BF9B53] ring-2 ring-white ring-offset-1 ring-offset-[#BF9B53] shrink-0" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Pickup
                </p>
                <p className="text-sm text-[#BF9B53] leading-tight mb-2">
                  {shipment.pickupLocation}
                </p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Delivery
                </p>
                <p className="text-sm text-[#BF9B53] leading-tight">
                  {shipment.deliveryLocation}
                </p>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 border border-gray-200 rounded-md p-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Pickup Date
              </p>
              <p className="text-sm font-bold text-gray-900 leading-snug">
                {getPickupDisplay()}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                {isDelivered ? "Delivered At" : "Delivery Date"}
              </p>
              <p className="text-sm font-bold text-gray-900 leading-snug">
                {getDeliveryDisplay()}
              </p>
              {!isDelivered && shipment.deliveryTimeOption && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {shipment.deliveryTimeOption}
                </p>
              )}
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Horses
              </p>
              <p className="text-sm font-bold text-gray-900">
                {shipment.numberOfHorses}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Status
              </p>
              <p
                className={`text-sm font-bold capitalize ${
                  shipment.status === "delivered"
                    ? "text-green-600"
                    : "text-gray-600"
                }`}
              >
                {shipment.status}
              </p>
            </div>
          </div>

          {/* Shipper */}
          {shipment.shipper ? (
            <div className="border border-gray-200 rounded-md p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#BF9B53]/10 border-2 border-[#BF9B53]/30 flex items-center justify-center text-sm font-bold text-[#BF9B53] shrink-0">
                {shipment.shipper.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-xs">
                  {shipment.shipper.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {shipment.shipper.email}
                </p>
              </div>
              <span className="text-xs font-bold uppercase tracking-wide bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded shrink-0">
                Shipper
              </span>
            </div>
          ) : (
            <div className="border border-dashed border-gray-200 rounded-md p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 text-sm" />
              <p className="text-xs text-gray-400 italic">
                No shipper assigned yet
              </p>
            </div>
          )}

          {/* Horses */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Horse Details ({shipment.numberOfHorses})
            </p>
            {shipment.horses?.map((h, i) => (
              <HorseCard key={i} horse={h} idx={i} />
            ))}
          </div>

          {/* Additional Info */}
          {shipment.additionalInfo && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-1">
                Additional Info
              </p>
              <p className="text-sm text-yellow-900">
                {shipment.additionalInfo}
              </p>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3 flex gap-2 flex-wrap">
          <button
            onClick={close}
            className="px-4 py-2 rounded-sm border border-gray-300 bg-white text-gray-700 text-xs font-bold hover:border-[#BF9B53] transition-colors"
          >
            Close
          </button>

          {/* Draft Actions */}
          {isDraft && (
            <>
              <button
                onClick={onEdit}
                className="flex-1 py-2 rounded-sm text-xs font-bold flex items-center justify-center gap-1 bg-gray-600 hover:bg-[#BF9B53] text-white transition-colors"
              >
                <FiEdit2 size={14} />
                Edit
              </button>
              <button
                onClick={onPublish}
                className="flex-1 py-2 rounded-sm text-xs font-bold flex items-center justify-center gap-1 bg-[#BF9B53] hover:bg-[#a8863e] text-white transition-colors"
              >
                <FiShare2 size={14} />
                Publish
              </button>
              <button
                onClick={onDelete}
                className="px-4 py-2 rounded-sm text-xs font-bold flex items-center justify-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
              >
                <FiTrash2 size={14} />
              </button>
            </>
          )}

          {/* In Progress */}
          {isInProgress && (
            <>
              <button
                onClick={onMetadataEdit}
                className="flex-1 py-2 rounded-sm text-xs font-bold flex items-center justify-center gap-1 bg-gray-600 hover:bg-[#BF9B53] text-white transition-colors"
              >
                <FiEdit2 size={14} />
                Edit Docs & Notes
              </button>
              <button
                onClick={onTrack}
                className="flex-1 py-2 rounded-sm text-xs font-bold flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <FiNavigation size={14} />
                Track Shipment
              </button>
              <button
                onClick={onNavigate}
                className="flex-1 py-2 rounded-sm text-xs font-bold flex items-center justify-center gap-1 bg-[#BF9B53] hover:bg-[#a8863e] text-white transition-colors"
              >
                <FiEye size={14} />
                View Details
              </button>
            </>
          )}

          {/* Non-draft, non-inProgress */}
          {!isDraft && !isInProgress && (
            <>
              {!isDelivered && !isCancelled && (
                <button
                  onClick={onMetadataEdit}
                  className="flex-1 py-2 rounded-sm text-xs font-bold flex items-center justify-center gap-1 bg-gray-600 hover:bg-[#BF9B53] text-white transition-colors"
                >
                  <FiEdit2 size={14} />
                  Edit Docs & Notes
                </button>
              )}
              <button
                onClick={onNavigate}
                className="flex-1 py-2 rounded-sm text-xs font-bold flex items-center justify-center gap-1 bg-[#BF9B53] hover:bg-[#a8863e] text-white transition-colors"
              >
                <FiEye size={14} />
                View Full Details
              </button>
            </>
          )}

          {/* Delivered: Rate Shipper */}
          {isDelivered && (
            <button
              onClick={() => {
                if (!alreadyReviewed) onReview();
              }}
              disabled={alreadyReviewed}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                alreadyReviewed
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                  : "bg-gray-800 hover:bg-gray-900 text-white cursor-pointer"
              }`}
            >
              {alreadyReviewed ? "Already Reviewed" : "Rate Shipper"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   ShipmentRow
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

  const truncateText = (text, maxLength = 30) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const getRowPickupDisplay = () => {
    const start = s.pickupDateRange?.start;
    const end = s.pickupDateRange?.end;
    if (start && end) {
      const s1 = fmt(start);
      const e1 = fmt(end);
      return s1 === e1 ? s1 : `${s1} – ${e1}`;
    }
    return fmt(s.pickupDate);
  };

  const isCancelled = s.status === "cancelled";
  const pendingQuestionCount =
    s.questionSummary?.unreadForCustomer ?? s.questionSummary?.pending ?? 0;

  //  First horse image from the shipment
  const firstHorseImage = s.horses?.find((h) => h.photo?.url)?.photo?.url;

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all duration-200 w-full ${
        isCancelled ? "opacity-70" : ""
      }`}
    >
      {/* Desktop View - Horizontal Layout */}
      <div className="hidden sm:flex items-center gap-3">
        {/* Image */}
        <div className="w-16 h-16 rounded-lg shrink-0 overflow-hidden border border-gray-300">
          {firstHorseImage ? (
            <img
              src={firstHorseImage}
              alt="horse"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center text-2xl ${
                isCancelled
                  ? "bg-red-100 text-red-500"
                  : "bg-[#BF9B53] text-white"
              }`}
            >
              <LiaHorseHeadSolid />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Code + Status */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-gray-800 font-mono">
              {s.shipmentCode}
            </span>
            <StatusChip status={s.status} />
            {pendingQuestionCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase bg-red-100 text-red-700">
                Question - {pendingQuestionCount}
              </span>
            )}
          </div>

          {/* Route */}
          <p className="text-sm font-semibold text-gray-700 truncate mb-2">
            {truncateText(s.pickupLocation, 40)} →{" "}
            {truncateText(s.deliveryLocation, 40)}
          </p>

          {/* Details Row */}
          <div className="flex items-center gap-3 text-xs">
            <div className="bg-blue-50 px-2.5 py-1.5 rounded-md border border-blue-200">
              <span className="font-semibold text-blue-700">
                {getRowPickupDisplay()}
              </span>
            </div>
            <div className="bg-amber-50 px-2.5 py-1.5 rounded-md border border-amber-200">
              <span className="font-semibold text-amber-700">
                {s.numberOfHorses} horses
              </span>
            </div>
            <div className="bg-green-50 px-2.5 py-1.5 rounded-md border border-green-200">
              <span className="font-semibold text-green-700 truncate">
                {s.shipper?.name ? truncateText(s.shipper.name, 15) : "Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={() => onView(s)}
          className="shrink-0 px-4 py-2 bg-[#BF9B53] hover:bg-[#A88A47] text-white font-bold text-xs rounded-sm transition-all duration-200 shadow-sm hover:shadow-md"
        >
          View
        </button>
      </div>

      {/* Mobile View - Vertical Layout */}
      <div className="sm:hidden space-y-2.5">
        {/* Top Row: Image + Code/Status */}
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-lg shrink-0 overflow-hidden border border-gray-300">
            {firstHorseImage ? (
              <img
                src={firstHorseImage}
                alt="horse"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center text-xl ${
                  isCancelled
                    ? "bg-red-100 text-red-500"
                    : "bg-[#BF9B53] text-white"
                }`}
              >
                <LiaHorseHeadSolid />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-bold text-gray-800 font-mono">
                {s.shipmentCode}
              </span>
              <StatusChip status={s.status} />
              {pendingQuestionCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700">
                  Question - {pendingQuestionCount}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-gray-700 truncate">
              {truncateText(s.pickupLocation, 30)}
            </p>
            <p className="text-xs font-semibold text-gray-700 truncate">
              {truncateText(s.deliveryLocation, 30)}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-blue-50 px-2 py-1.5 rounded-md border border-blue-200 text-center">
            <p className="text-xs font-semibold text-blue-700 truncate">
              {getRowPickupDisplay()}
            </p>
          </div>
          <div className="bg-amber-50 px-2 py-1.5 rounded-md border border-amber-200 text-center">
            <p className="text-xs font-semibold text-amber-700">
              {s.numberOfHorses}
            </p>
          </div>
          <div className="bg-green-50 px-2 py-1.5 rounded-md border border-green-200 text-center">
            <p className="text-xs font-semibold text-green-700 truncate">
              {s.shipper?.name ? truncateText(s.shipper.name, 12) : "Pending"}
            </p>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={() => onView(s)}
          className="w-full py-2.5 bg-[#BF9B53] hover:bg-[#A88A47] text-white font-bold text-xs rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Valid tab keys
───────────────────────────────────────── */
const VALID_TABS = [
  "published",
  "draft",
  "inProgress",
  "completed",
  "cancelled",
];

/* ─────────────────────────────────────────
   Main Page
───────────────────────────────────────── */
const AllShipments = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { shipments, loading, fetchCompletedShipments } =
    useDeliveredShipments();
  const { publishShipment, deleteShipment, fetchShipmentById } =
    useCustomerShipments();
  const { addReview, myReviews } = useReview();

  const [selected, setSelected] = React.useState(null);
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [actionText, setActionText] = React.useState("");

  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    return VALID_TABS.includes(tabParam) ? tabParam : "published";
  };

  const [tab, setTab] = React.useState(getInitialTab);

  const [confirmModal, setConfirmModal] = React.useState({
    open: false,
    action: null,
    shipmentId: null,
  });

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setTab(tabParam);
    }
  }, [location.search]);

  React.useEffect(() => {
    fetchCompletedShipments();
  }, [fetchCompletedShipments]);

  const handleTabChange = (key) => {
    setTab(key);
    const params = new URLSearchParams(location.search);
    params.set("tab", key);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const handleReviewSubmit = async (data) => {
    if (!selected) return;
    try {
      await addReview({
        shipperId: selected.shipper._id,
        shipmentId: selected._id,
        rating: data.rating,
        reviewText: data.reviewText,
      });
      Toast.success("Review submitted successfully!");
      setReviewOpen(false);
      setTimeout(() => setSelected(null), 100);
    } catch (err) {
      Toast.error(err.message || "Failed to submit review");
    }
  };

  const openPublishConfirm = () => {
    setSelected(null);
    setTimeout(() => {
      setConfirmModal({
        open: true,
        action: "publish",
        shipmentId: selected?._id,
      });
    }, 320);
  };

  const openDeleteConfirm = () => {
    setSelected(null);
    setTimeout(() => {
      setConfirmModal({
        open: true,
        action: "delete",
        shipmentId: selected?._id,
      });
    }, 320);
  };

  const handlePublish = async () => {
    if (!confirmModal.shipmentId) return;
    setConfirmModal({ open: false, action: null, shipmentId: null });
    setActionText("Publishing shipment...");
    setActionLoading(true);
    try {
      await publishShipment(confirmModal.shipmentId);
      Toast.success("Shipment published successfully!");
      fetchCompletedShipments();
    } catch (err) {
      Toast.error(err.message || "Failed to publish shipment");
    } finally {
      setActionLoading(false);
      setActionText("");
    }
  };

  const handleDelete = async () => {
    if (!confirmModal.shipmentId) return;
    setConfirmModal({ open: false, action: null, shipmentId: null });
    setActionText("Deleting shipment...");
    setActionLoading(true);
    try {
      await deleteShipment(confirmModal.shipmentId);
      Toast.success("Shipment deleted successfully!");
      fetchCompletedShipments();
    } catch (err) {
      Toast.error(err.message || "Failed to delete shipment");
    } finally {
      setActionLoading(false);
      setActionText("");
    }
  };

  const confirmAction = () => {
    if (confirmModal.action === "publish") handlePublish();
    else if (confirmModal.action === "delete") handleDelete();
  };

  const handleNavigateToDetails = (shipment = selected) => {
    if (!shipment) return;
    const token = createShipmentQueryToken(shipment._id);
    const params = new URLSearchParams({
      shipmentId: shipment._id,
      ref: token,
    });
    navigate(`/customer/my-shipments?${params.toString()}`);
    setSelected(null);
  };

  const handleEditShipment = async () => {
    if (!selected) return;
    try {
      await fetchShipmentById(selected._id);
      navigate(`/customer/new-shipment/${selected._id}`, {
        state: { editMode: true, shipment: selected },
      });
      setSelected(null);
    } catch (err) {
      Toast.error(err.message || "Failed to load shipment for editing");
    }
  };

  const handleEditMetadata = async () => {
    if (!selected) return;
    try {
      await fetchShipmentById(selected._id);
      navigate(`/customer/new-shipment/${selected._id}`, {
        state: {
          editMode: true,
          metadataOnly: true,
          shipment: selected,
        },
      });
      setSelected(null);
    } catch (err) {
      Toast.error(err.message || "Failed to load shipment metadata");
    }
  };

  const handleTrackShipment = (shipment = selected) => {
    if (!shipment) {
      Toast.error("Cannot track this shipment");
      return;
    }
    if (!shipment.quoteId) {
      Toast.error("Tracking not available for this shipment yet");
      return;
    }
    navigate(`/customer/track/${shipment.quoteId}`);
    setSelected(null);
  };

  const hasReviewed = (id) => myReviews.some((r) => r.shipmentId === id);

  if (loading)
    return <PageLoader text="Loading shipments..." fullScreen={false} />;

  const inProgressStatuses = ["assigned", "picked", "in_transit"];

  const isCancelledShipment = (shipment) => shipment?.status === "cancelled";

  const isCompletedShipment = (shipment) =>
    shipment?.isCompleted === true ||
    shipment?.status === "delivered" ||
    Boolean(shipment?.deliveredAt);

  const isDraftShipment = (shipment) =>
    !isCancelledShipment(shipment) &&
    !isCompletedShipment(shipment) &&
    shipment?.publish !== true;

  const isInProgressShipment = (shipment) =>
    !isDraftShipment(shipment) &&
    !isCompletedShipment(shipment) &&
    !isCancelledShipment(shipment) &&
    (shipment?.isInProgress === true ||
      inProgressStatuses.includes(shipment?.status));

  const isUpcomingShipment = (shipment) =>
    !isDraftShipment(shipment) &&
    !isInProgressShipment(shipment) &&
    !isCompletedShipment(shipment) &&
    !isCancelledShipment(shipment) &&
    shipment?.publish === true;

  const draft = shipments.filter((s) => isDraftShipment(s));
  const inProgress = shipments.filter((s) => isInProgressShipment(s));
  const published = shipments.filter((s) => isUpcomingShipment(s));
  const completed = shipments.filter((s) => isCompletedShipment(s));
  const cancelled = shipments.filter((s) => isCancelledShipment(s));

  const tabMap = { draft, inProgress, published, completed, cancelled };
  const shown = tabMap[tab] || [];

  const TABS = [
    { key: "published", label: "Upcoming", count: published.length },
    { key: "draft", label: "Draft", count: draft.length },
    { key: "inProgress", label: "In Progress", count: inProgress.length },
    { key: "completed", label: "Completed", count: completed.length },
    { key: "cancelled", label: "Cancelled", count: cancelled.length },
  ];

  const activeTabColor = {
    draft: "border-gray-600 text-gray-700",
    inProgress: "border-blue-600 text-blue-600",
    published: "border-purple-600 text-purple-600",
    completed: "border-[#BF9B53] text-[#BF9B53]",
    cancelled: "border-red-500 text-red-500",
  };

  const activeBadgeColor = {
    draft: "bg-gray-600 text-white",
    inProgress: "bg-blue-600 text-white",
    published: "bg-purple-600 text-white",
    completed: "bg-[#BF9B53] text-white",
    cancelled: "bg-red-500 text-white",
  };

  const emptyMsg = {
    draft: "No draft shipments. Create one to get started!",
    inProgress: "No shipments in progress.",
    published: "No upcoming shipments.",
    completed: "No completed shipments yet.",
    cancelled: "No cancelled shipments.",
  };

  return (
    <div className="w-full min-h-screen font-montserrat">
      {actionLoading && <PageLoader text={actionText} fullScreen={true} />}

      {confirmModal.open && (
        <ConfirmModal
          show={confirmModal.open}
          title={
            confirmModal.action === "publish"
              ? "Publish Shipment"
              : "Delete Shipment"
          }
          message={
            confirmModal.action === "publish"
              ? "Are you sure you want to publish this shipment? It will be visible to shippers."
              : "Are you sure you want to delete this shipment? This action cannot be undone."
          }
          onConfirm={confirmAction}
          onCancel={() =>
            setConfirmModal({ open: false, action: null, shipmentId: null })
          }
          confirmText={confirmModal.action === "publish" ? "Publish" : "Delete"}
          confirmColor={confirmModal.action === "publish" ? "blue" : "red"}
        />
      )}

      {reviewOpen && selected && (
        <ReviewModal
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          shipment={selected}
          onSubmit={handleReviewSubmit}
        />
      )}

      {selected && !actionLoading && (
        <ShipmentDrawer
          shipment={selected}
          onClose={() => setSelected(null)}
          onReview={() => setReviewOpen(true)}
          alreadyReviewed={hasReviewed(selected._id)}
          isDraft={tab === "draft"}
          isInProgress={tab === "inProgress"}
          onPublish={openPublishConfirm}
          onDelete={openDeleteConfirm}
          onNavigate={() => handleNavigateToDetails(selected)}
          onEdit={handleEditShipment}
          onMetadataEdit={handleEditMetadata}
          onTrack={() => handleTrackShipment(selected)}
        />
      )}

      <div className="w-full max-w-full mx-auto">
        <div className="flex flex-col gap-2 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Shipments</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage and track all your horse transport requests
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="bg-[#BF9B53] rounded-sm px-3 py-2 text-center min-w-14">
              <p className="text-lg font-bold text-white leading-none">
                {shipments.length}
              </p>
              <p className="text-xs text-white font-medium mt-0.5">Total</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-gray-300 mb-3 overflow-x-auto pb-0">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => handleTabChange(t.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors duration-150 bg-transparent whitespace-nowrap
                  ${
                    active
                      ? `${activeTabColor[t.key]} border-b-2`
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                {t.label}
                <span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded-full leading-none ml-1 ${
                    active
                      ? activeBadgeColor[t.key]
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* List */}
        {shown.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-base font-bold text-gray-800 mb-1">
              {tab === "draft"
                ? "No Draft Shipments"
                : tab === "inProgress"
                ? "No In Progress Shipments"
                : tab === "published"
                ? "No Upcoming Shipments"
                : tab === "completed"
                ? "No Completed Shipments"
                : "No Cancelled Shipments"}
            </p>
            <p className="text-xs text-gray-400">{emptyMsg[tab]}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
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
