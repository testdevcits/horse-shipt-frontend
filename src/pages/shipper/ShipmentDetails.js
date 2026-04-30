import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { validateShipmentQueryToken } from "../../utils/createQueryToken";
import { SlLocationPin } from "react-icons/sl";
import { LuCalendarDays, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { FiChevronDown, FiChevronUp, FiMail, FiFileText } from "react-icons/fi";
import { MdChat, MdHelpOutline } from "react-icons/md";
import { BiMapPin, BiRocket } from "react-icons/bi";
import { useShipperShipment } from "../../contexts/shipperContext/ShipperShipmentContext";
import OfferSubmitModal from "./OfferSubmitModal";
import { getPublishedTime } from "../../utils/timeAgo";
import AskQuestionModal from "./AskQuestionModal";
import RouteMap from "./common/RouteMap";
import { IoArrowBack } from "react-icons/io5";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  MessageCircleMore,
} from "lucide-react";
import { useShipperPayments } from "../../contexts/shipperContext/ShipperPaymentContext";

/**
 * ============================================================
 * SHIPMENT DETAILS PAGE WITH COUNTDOWN TIMER
 * Shows session expiration time and auto-navigates after timeout
 * ============================================================
 */

// ── Fallback SVG shown when a horse photo fails to load ──────────────────────
const HorseFallback = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-600">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-16 h-16 mb-2 opacity-50"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="32" cy="38" rx="18" ry="14" />
      <path d="M14 38 Q10 28 16 20 Q22 12 30 14 L34 14 Q42 12 46 20 Q50 28 50 38" />
      <path d="M30 14 Q28 8 24 6" />
      <path d="M34 14 Q36 8 40 6" />
      <circle cx="22" cy="24" r="2" fill="currentColor" />
      <path d="M50 38 Q56 40 58 48 L50 46" />
      <path d="M14 38 Q8 40 6 48 L14 46" />
    </svg>
    <p className="text-xs font-bold text-yellow-500 uppercase tracking-wide">
      No Photo
    </p>
  </div>
);

// ── Small thumbnail fallback ──────────────────────────────────────────────────
const ThumbFallback = () => (
  <div className="w-full h-full flex items-center justify-center bg-yellow-50 text-yellow-400">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8 opacity-60"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="32" cy="38" rx="18" ry="14" />
      <path d="M14 38 Q10 28 16 20 Q22 12 30 14 L34 14 Q42 12 46 20 Q50 28 50 38" />
    </svg>
  </div>
);

// ── Document icon map ─────────────────────────────────────────────────────────
const DOC_COLORS = {
  coggins: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
  healthCertificate:
    "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
  other: "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100",
};

const ShipmentDetails = ({ shipmentId: defaultId }) => {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const shipmentIdFromQuery = searchParams.get("shipmentId");
  const tokenFromQuery = searchParams.get("ref");

  const { shipments, getAvailableShipments, loading } = useShipperShipment();
  const [isQuestionOpen, setIsQuestionOpen] = useState(false);

  const [shipment, setShipment] = useState(null);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [expandedHorse, setExpandedHorse] = useState(null);
  const [horseImageIndex, setHorseImageIndex] = useState({});
  const [showQuoteSuccess, setShowQuoteSuccess] = useState(false);

  const { needsOnboarding } = useShipperPayments();

  // ── Document viewer state ──────────────────────────────────────────────────
  const [viewingDoc, setViewingDoc] = useState(null); // { url, label }

  // ── Timer state ───────────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  const idToUse = shipmentIdFromQuery || paramId || defaultId;

  // ── Validation & countdown ────────────────────────────────────────────────
  useEffect(() => {
    if (!validateShipmentQueryToken(tokenFromQuery, idToUse)) {
      navigate("/shipper/dashboard", { replace: true });
      return;
    }

    try {
      const decoded = JSON.parse(atob(tokenFromQuery));
      const remaining = decoded.exp - Date.now();

      if (remaining > 0) {
        setTimeLeft(remaining);

        const timerInterval = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1000) {
              clearInterval(timerInterval);
              setIsExpired(true);
              setTimeout(() => {
                navigate("/shipper/dashboard", { replace: true });
              }, 2000);
              return 0;
            }
            return prev - 1000;
          });
        }, 1000);

        return () => clearInterval(timerInterval);
      } else {
        setIsExpired(true);
        navigate("/shipper/dashboard", { replace: true });
      }
    } catch {
      navigate("/shipper/dashboard", { replace: true });
    }
  }, [tokenFromQuery, idToUse, navigate]);

  // ── Fetch shipments ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!shipments.length) getAvailableShipments();
  }, [shipments.length, getAvailableShipments]);

  // ── Find shipment ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!idToUse || !shipments.length) return;
    const found = shipments.find((s) => String(s._id) === String(idToUse));
    setShipment(found || null);
    if (found) setExpandedHorse(0);
  }, [idToUse, shipments]);

  // ── Timer helpers ─────────────────────────────────────────────────────────
  const formatTimeRemaining = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    return {
      minutes: Math.floor(totalSeconds / 60),
      seconds: totalSeconds % 60,
      totalSeconds,
    };
  };

  const timeData = timeLeft ? formatTimeRemaining(timeLeft) : null;
  const progressPercent = timeLeft ? (timeLeft / (5 * 60 * 1000)) * 100 : 0;

  const handleQuoteSuccess = () => {
    setShowQuoteSuccess(true);

    setTimeout(() => {
      navigate("/shipper/quotes");
    }, 1800);
  };

  // ── Horse PHOTO-only images (no documents) ────────────────────────────────
  const getHorsePhotos = (horseId) => {
    if (!shipment) return [];
    const horse = shipment.horses.find((h) => h._id === horseId);
    if (!horse?.photo?.url) return [];
    return [{ url: horse.photo.url, label: "Main Photo" }];
  };

  // ── Horse documents (coggins, healthCert, other) ──────────────────────────
  const getHorseDocs = (horseId) => {
    if (!shipment) return [];
    const horse = shipment.horses.find((h) => h._id === horseId);
    if (!horse) return [];
    const docs = [];
    if (horse.documents?.coggins?.url)
      docs.push({
        key: "coggins",
        label: "Coggins",
        url: horse.documents.coggins.url,
      });
    if (horse.documents?.healthCertificate?.url)
      docs.push({
        key: "healthCertificate",
        label: "Health Certificate",
        url: horse.documents.healthCertificate.url,
      });
    if (horse.documents?.other?.url)
      docs.push({
        key: "other",
        label: "Other Document",
        url: horse.documents.other.url,
      });
    return docs;
  };

  const handleNextImage = (e, index, len) => {
    e.stopPropagation();
    setHorseImageIndex((prev) => ({
      ...prev,
      [index]: ((prev[index] || 0) + 1) % len,
    }));
  };

  const handlePrevImage = (e, index, len) => {
    e.stopPropagation();
    setHorseImageIndex((prev) => ({
      ...prev,
      [index]: ((prev[index] || 0) - 1 + len) % len,
    }));
  };

  // ── Date formatter ────────────────────────────────────────────────────────
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center font-montserrat justify-center h-screen">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-sm bg-gradient-to-r from-[#BF9B53] to-[#9d7d42] flex items-center justify-center">
            <div className="text-4xl animate-bounce">🏇</div>
          </div>
          <p className="text-gray-700 font-semibold text-lg">
            Loading shipment details...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Please wait while we prepare the information
          </p>
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!shipment) {
    return (
      <div className="flex items-center justify-center mt-20 font-montserrat">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Shipment Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The shipment you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/shipper/dashboard")}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#BF9B53] to-[#9d7d42] text-white rounded-sm font-bold hover:shadow-lg transition-all duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="font-montserrat w-full min-h-screen">
      {/* ── DOCUMENT VIEWER MODAL ───────────────────────────────────────────── */}
      {viewingDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setViewingDoc(null)}
        >
          <div
            className="bg-white rounded-sm shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <FiFileText className="text-[#BF9B53]" size={22} />
                <h3 className="text-lg font-black text-gray-900">
                  {viewingDoc.label}
                </h3>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="w-9 h-9 flex items-center justify-center rounded-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center min-h-[60vh]">
              {viewingDoc.url.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={viewingDoc.url}
                  title={viewingDoc.label}
                  className="w-full h-full min-h-[60vh]"
                  style={{ border: "none" }}
                />
              ) : (
                <img
                  src={viewingDoc.url}
                  alt={viewingDoc.label}
                  className="max-w-full max-h-[70vh] object-contain rounded-sm shadow"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              )}
              {/* Error fallback inside modal */}
              <div className="hidden w-full h-64 items-center justify-center flex-col text-gray-400 gap-3">
                <FiFileText size={48} className="opacity-30" />
                <p className="font-semibold text-sm">Could not load document</p>
                <a
                  href={viewingDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#BF9B53] underline text-sm font-bold"
                >
                  Open in new tab
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
              <a
                href={viewingDoc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-[#BF9B53] hover:underline"
              >
                Open in new tab ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {showQuoteSuccess && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-sm bg-white shadow-lg border border-emerald-100 p-4 sm:p-5 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-sm bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">
              Quote Submitted
            </h3>
            <p className="mt-3 text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
              Your quote was sent successfully. We&apos;re taking you to your
              orders page now.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#BF9B53] animate-bounce" />
              <div
                className="w-2.5 h-2.5 rounded-sm bg-[#BF9B53] animate-bounce"
                style={{ animationDelay: "0.15s" }}
              />
              <div
                className="w-2.5 h-2.5 rounded-sm bg-[#BF9B53] animate-bounce"
                style={{ animationDelay: "0.3s" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── COUNTDOWN TIMER BAR ─────────────────────────────────────────────── */}
      {timeLeft !== null && !isExpired && (
        <div className="sticky top-0 z-10 bg-gradient-to-r from-gray-500 via-gray-500 to-gray-500 shadow-lg">
          <div className="w-full h-2 bg-white">
            <div
              className="h-full bg-[#BF9B53] rounded-sm backdrop-blur-sm transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-4 py-2 sm:py-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-white/20 backdrop-blur rounded-sm flex-shrink-0">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-white/80 font-medium">
                    Session Expires In
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                      {String(timeData.minutes).padStart(2, "0")}:
                      {String(timeData.seconds).padStart(2, "0")}
                    </span>
                    <span className="text-xs sm:text-sm text-white/70 font-semibold">
                      remaining
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/15 backdrop-blur rounded-sm border border-white/20 flex-shrink-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
                <p className="text-xs sm:text-sm text-white font-semibold">
                  {timeData.totalSeconds < 60
                    ? "Hurry! Saving soon"
                    : "Auto-save your work"}
                </p>
              </div>
            </div>

            {timeData.totalSeconds < 60 && (
              <div className="mt-2 p-1 bg-[#BF9B53] rounded-sm border border-[#BF9B53]">
                <p className="text-xs sm:text-sm text-white font-semibold">
                  Less than 1 minute remaining. You will be redirected to
                  dashboard when time expires.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── EXPIRED OVERLAY ─────────────────────────────────────────────────── */}
      {isExpired && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-lg max-w-md w-full p-4 sm:p-5 text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Session Expired
            </h2>
            <p className="text-gray-600 font-semibold text-sm sm:text-base">
              Your viewing session has expired. You are being redirected to the
              dashboard.
            </p>
            <div className="flex gap-2 justify-center">
              <div className="animate-bounce w-2 h-2 bg-[#BF9B53] rounded-sm" />
              <div
                className="animate-bounce w-2 h-2 bg-[#BF9B53] rounded-sm"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="animate-bounce w-2 h-2 bg-[#BF9B53] rounded-sm"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-full mx-auto px-3 sm:px-4 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-1 uppercase">
                Shipment Details
              </h1>
              <div className="inline-block bg-gradient-to-r from-[#BF9B53] to-[#9d7d42] text-white px-2 py-0.5 rounded-sm text-xs sm:text-sm font-bold">
                {shipment.shipmentCode}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm text-gray-600">
                Listed{" "}
                <span className="font-semibold text-[#BF9B53]">
                  {getPublishedTime(shipment.publishedAt)}
                </span>
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                by{" "}
                <span className="font-semibold text-[#BF9B53]">
                  {shipment.customer?.name}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div className="max-w-full mx-auto px-3 sm:px-4 mt-4 space-y-4">
        {/* ── HERO SECTION ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* LEFT: First horse photo + map */}
          <div className="lg:col-span-1">
            <div className="relative overflow-hidden rounded-sm border border-[#BF9B53] shadow-sm bg-white group h-[260px] sm:h-[320px] lg:h-[360px]">
              {shipment.horses[0]?.photo?.url ? (
                <img
                  src={shipment.horses[0].photo.url}
                  alt={shipment.horses[0]?.registeredName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              {/* Fallback */}
              <div
                className="absolute inset-0"
                style={{
                  display: shipment.horses[0]?.photo?.url ? "none" : "flex",
                }}
              >
                <HorseFallback />
              </div>

              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-sm text-xs sm:text-sm font-bold text-gray-900 shadow-sm">
                Horse 1 of {shipment.numberOfHorses}
              </div>
              <div className="absolute bottom-3 left-3 bg-gradient-to-r from-[#BF9B53] to-[#9d7d42] text-white px-3 py-1.5 rounded-sm text-xs font-bold uppercase shadow-sm">
                {shipment.status?.replace("_", " ")}
              </div>
            </div>

            {/* Route Map */}
            <div className="mt-4">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                Route Map
              </p>
              <div className="w-full rounded-sm overflow-hidden border border-[#BF9B53]">
                <RouteMap
                  pickup={shipment.pickupLocation}
                  delivery={shipment.deliveryLocation}
                />
              </div>
            </div>
          </div>

          {/* MIDDLE & RIGHT */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Route Card */}
            <div className="bg-white rounded-sm border border-[#BF9B53] p-3 sm:p-4 shadow-sm">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <BiMapPin className="text-[#BF9B53]" size={22} />
                Route Information
              </h2>

              <div className="space-y-4">
                {/* Pickup */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-sm bg-gray-100 border border-[#BF9B53]">
                      <SlLocationPin size={20} className="text-[#BF9B53]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">
                      Pickup Location
                    </p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 mb-2 leading-snug">
                      {shipment.pickupLocation}
                    </p>
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 bg-blue-50 w-fit px-2 py-1.5 rounded-sm">
                      <LuCalendarDays size={16} />
                      {formatDate(shipment.pickupDateRange.start)} –{" "}
                      {formatDate(shipment.pickupDateRange.end)}
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-start px-5">
                  <div className="w-px h-7 bg-gradient-to-b from-gray-300 to-transparent rounded-sm" />
                </div>

                {/* Delivery */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-sm bg-gray-100 border border-[#BF9B53]">
                      <BiRocket size={20} className="text-[#BF9B53]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">
                      Delivery Location
                    </p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 mb-2 leading-snug">
                      {shipment.deliveryLocation}
                    </p>
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 bg-green-50 w-fit px-2 py-1.5 rounded-sm">
                      <LuCalendarDays size={16} />
                      {formatDate(shipment.deliveryDateRange.start)} –{" "}
                      {formatDate(shipment.deliveryDateRange.end)}
                    </div>
                  </div>
                </div>

                {/* Distance */}
                <div className="pt-4 border-t border-[#BF9B53]/40 mt-2">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                    Total Distance
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#BF9B53] to-[#9d7d42] bg-clip-text text-transparent">
                      {shipment.estimatedDistance?.miles || 200}
                    </span>
                    <div>
                      <span className="text-gray-700 font-bold text-sm sm:text-base">
                        miles
                      </span>
                      {shipment.estimatedDistance && (
                        <p className="text-xs sm:text-sm text-gray-500 font-semibold">
                          ({shipment.estimatedDistance.km} km)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-sm border border-[#BF9B53] p-3 sm:p-4 shadow-sm">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">
                  Customer Info
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                      Name
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {shipment.customer?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-yellow-50 p-2 rounded-sm">
                    <FiMail size={18} className="text-gray-600 flex-shrink-0" />
                    <p className="text-sm font-semibold text-gray-600 break-all">
                      {shipment.customer?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-sm border border-[#BF9B53] p-3 shadow-sm">
                  <p className="text-xs font-black text-[#BF9B53] uppercase mb-2">
                    Horses
                  </p>
                  <p className="text-3xl font-black text-gray-700">
                    {shipment.numberOfHorses}
                  </p>
                </div>
                <div className="bg-white rounded-sm border border-[#BF9B53] p-3 shadow-sm">
                  <p className="text-xs font-black text-[#BF9B53] uppercase mb-2">
                    Status
                  </p>
                  <p className="text-xs font-bold text-orange-900 capitalize">
                    {shipment.status?.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:col-span-2">
                <div className="rounded-sm border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-3 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wider text-amber-700 mb-2">
                    Pickup Window
                  </p>
                  <p className="text-sm font-bold text-gray-900 leading-relaxed">
                    {formatDate(shipment.pickupDateRange.start)} to{" "}
                    {formatDate(shipment.pickupDateRange.end)}
                  </p>
                </div>
                <div className="rounded-sm border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-3 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-700 mb-2">
                    Delivery Window
                  </p>
                  <p className="text-sm font-bold text-gray-900 leading-relaxed">
                    {formatDate(shipment.deliveryDateRange.start)} to{" "}
                    {formatDate(shipment.deliveryDateRange.end)}
                  </p>
                </div>
                <div className="rounded-sm border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-600 mb-2">
                    Route Snapshot
                  </p>
                  <p className="text-sm font-bold text-gray-900 leading-relaxed">
                    {shipment.pickupLocation} to {shipment.deliveryLocation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── HORSES DETAILS ACCORDION ────────────────────────────────────────── */}
        <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#BF9B53]/10 to-transparent p-3 sm:p-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-black text-gray-900 flex items-center gap-2">
              Horse Details
              <span className="text-sm bg-[#BF9B53] text-white px-2 py-0.5 rounded-sm">
                {shipment.numberOfHorses}
              </span>
            </h2>
          </div>

          {/* Horses List */}
          <div className="divide-y divide-gray-200">
            {shipment.horses.map((horse, index) => {
              const photos = getHorsePhotos(horse._id);
              const docs = getHorseDocs(horse._id);
              const imgIdx = horseImageIndex[index] || 0;

              return (
                <div key={horse._id} className="overflow-hidden">
                  {/* Horse Header */}
                  <div
                    onClick={() =>
                      setExpandedHorse(expandedHorse === index ? null : index)
                    }
                    className="flex items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 hover:bg-[#BF9B53]/5 cursor-pointer transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-sm overflow-hidden border border-gray-200 group-hover:border-[#BF9B53] transition-colors shadow-sm">
                        {horse.photo?.url ? (
                          <img
                            src={horse.photo.url}
                            alt={horse.registeredName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          style={{
                            display: horse.photo?.url ? "none" : "flex",
                          }}
                          className="w-full h-full"
                        >
                          <ThumbFallback />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                          {horse.registeredName}
                        </h3>
                        <p className="text-sm text-gray-600 font-semibold">
                          Barn Name:{" "}
                          <span className="text-gray-900">
                            {horse.barnName}
                          </span>
                        </p>
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-sm font-bold">
                            {horse.breed}
                          </span>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-sm font-bold">
                            {horse.sex}
                          </span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-sm font-bold">
                            Age: {horse.age}
                          </span>
                        </div>
                      </div>
                    </div>
                    {expandedHorse === index ? (
                      <FiChevronUp
                        size={24}
                        className="text-[#BF9B53] flex-shrink-0"
                      />
                    ) : (
                      <FiChevronDown
                        size={24}
                        className="text-gray-400 flex-shrink-0"
                      />
                    )}
                  </div>

                  {/* Horse Expanded Details */}
                  {expandedHorse === index && (
                    <div className="p-3 sm:p-4 bg-white space-y-5">
                      {/* ── PHOTO CAROUSEL (horse images only) ─────────────────── */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-black text-gray-500 uppercase tracking-wider">
                          Horse Photo
                        </h4>

                        {photos.length > 0 ? (
                          <div className="relative overflow-hidden rounded-sm border border-gray-200 bg-gray-100">
                            <img
                              src={photos[imgIdx]?.url}
                              alt={photos[imgIdx]?.label}
                              className="w-full h-56 sm:h-72 object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                            {/* Fallback inside carousel */}
                            <div
                              className="w-full h-56 sm:h-72 items-center justify-center"
                              style={{ display: "none" }}
                            >
                              <HorseFallback />
                            </div>

                            {/* Label badge */}
                            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-sm text-xs sm:text-sm font-bold text-gray-900 shadow-sm">
                              {photos[imgIdx]?.label}
                            </div>

                            {/* Navigation (only if multiple photos) */}
                            {photos.length > 1 && (
                              <>
                                <button
                                  onClick={(e) =>
                                    handlePrevImage(e, index, photos.length)
                                  }
                                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2 rounded-sm shadow transition-all duration-300 z-10"
                                >
                                  <LuChevronLeft size={24} />
                                </button>
                                <button
                                  onClick={(e) =>
                                    handleNextImage(e, index, photos.length)
                                  }
                                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2 rounded-sm shadow transition-all duration-300 z-10"
                                >
                                  <LuChevronRight size={24} />
                                </button>
                                <div className="absolute bottom-3 right-3 bg-gray-900/80 text-white px-2 py-1 rounded-sm text-xs font-bold">
                                  {imgIdx + 1} of {photos.length}
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-56 sm:h-72 rounded-sm border border-dashed border-gray-200 overflow-hidden">
                            <HorseFallback />
                          </div>
                        )}
                      </div>

                      {/* ── DOCUMENT BUTTONS ────────────────────────────────────── */}
                      {docs.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-black text-gray-500 uppercase tracking-wider">
                            Documents
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {docs.map((doc) => (
                              <button
                                key={doc.key}
                                onClick={() =>
                                  setViewingDoc({
                                    url: doc.url,
                                    label: doc.label,
                                  })
                                }
                                className={`flex items-center gap-2 px-3 py-2 rounded-sm border font-bold text-sm transition-all duration-200 shadow-sm hover:shadow-md ${
                                  DOC_COLORS[doc.key] ||
                                  "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                <FiFileText size={18} />
                                {doc.label}
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 font-medium">
                            Click a document to view it — it will open in a
                            preview panel.
                          </p>
                        </div>
                      )}

                      {/* ── HORSE DETAILS GRID ──────────────────────────────────── */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-black text-gray-500 uppercase tracking-wider">
                          Horse Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {[
                            { label: "Breed", value: horse.breed },
                            { label: "Color", value: horse.colour },
                            {
                              label: "Age",
                              value: horse.age ? `${horse.age} years old` : "—",
                            },
                            { label: "Sex", value: horse.sex },
                            {
                              label: "Stall Size",
                              value: horse.requestedStallSize,
                            },
                            {
                              label: "Registered Name",
                              value: horse.registeredName,
                            },
                          ].map(({ label, value }) => (
                            <div
                              key={label}
                              className="rounded-sm border border-gray-100 bg-gray-50 p-3"
                            >
                              <p className="text-xs font-black text-gray-500 uppercase mb-1">
                                {label} :-
                              </p>
                              <p className="text-sm sm:text-base font-bold text-[#BF9B53] break-words">
                                {value || "—"}
                              </p>
                            </div>
                          ))}
                        </div>

                        {horse.generalInfo && (
                          <div className="bg-yellow-50 border border-[#BF9B53] rounded-sm p-3">
                            <p className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                              General Information :-
                            </p>
                            <p className="text-[#BF9B53] leading-relaxed text-base font-semibold">
                              {horse.generalInfo}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/*ACTION BUTTONS*/}
        <div className="rounded-sm border border-[#BF9B53]/30 bg-gradient-to-br from-white via-[#FFF9ED] to-[#F7F2E8] shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-3 sm:p-4 border-b lg:border-b-0 lg:border-r border-[#BF9B53]/20">
              <p className="text-xs font-black uppercase tracking-wider text-[#BF9B53] mb-2">
                Ready To Respond
              </p>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-tight">
                Send your quote or start the conversation before the session
                ends
              </h2>
              <p className="mt-2 text-sm text-gray-600 font-medium max-w-2xl">
                Review the route, horse details, and dates above. When you are
                ready, submit your offer or open chat to clarify anything with
                the customer first.
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-sm bg-white/80 border border-white shadow-sm p-3">
                  <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                    Shipment Code
                  </p>
                  <p className="text-base font-black text-gray-900">
                    {shipment.shipmentCode}
                  </p>
                </div>
                <div className="rounded-sm bg-white/80 border border-white shadow-sm p-3">
                  <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                    Customer
                  </p>
                  <p className="text-base font-black text-gray-900">
                    {shipment.customer?.name || "Customer"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-white/70">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-sm bg-[#BF9B53] flex items-center justify-center">
                  <MessageCircleMore className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-[#BF9B53]">
                    Quick Actions
                  </p>
                  <p className="text-sm text-gray-600 font-semibold">
                    Choose how you want to continue
                  </p>
                </div>
              </div>

              {needsOnboarding ? (
                <div className="bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l border-[#BF9B53] p-3 rounded-sm shadow-sm flex flex-col items-center text-center gap-3">
                  <p className="text-sm text-gray-700 font-medium">
                    Please complete your account setup to submit an offer.
                  </p>

                  <button
                    onClick={() => navigate("/shipper/settings?tab=payment")}
                    className="px-4 py-2 bg-[#BF9B53] text-white font-semibold text-sm rounded-sm hover:bg-[#9d7d42] transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Complete Setup
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setIsOfferOpen(true)}
                    className="relative group bg-gradient-to-r from-[#BF9B53] to-[#9d7d42] text-white px-4 py-3 rounded-sm font-black text-base hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
                    <span className="relative">Submit an Offer</span>
                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        `/shipper/chat?customerId=${shipment.customer?._id}`
                      )
                    }
                    className="border border-[#BF9B53] text-[#BF9B53] px-4 py-3 rounded-sm font-black text-base hover:bg-[#BF9B53]/5 transition-all duration-300 flex items-center justify-center gap-2 bg-white"
                  >
                    <MdChat size={22} />
                    Chat with Customer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── ASK QUESTION ────────────────────────────────────────────────────── */}
        <button
          onClick={() => setIsQuestionOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-sm font-bold hover:border-[#BF9B53] hover:text-[#BF9B53] hover:bg-[#BF9B53]/5 transition-all duration-300"
        >
          <MdHelpOutline size={22} />
          Ask a Question
        </button>

        <div className="h-3" />
      </div>

      {/* ── BACK BUTTON ─────────────────────────────────────────────────────── */}
      <button
        onClick={() => navigate(-1)}
        className="fixed bottom-4 right-4 bg-gray-600 text-white p-3 rounded-sm shadow-lg hover:bg-[#BF9B53] transition"
      >
        <IoArrowBack className="w-5 h-5" />
      </button>

      {/* ── MODALS ──────────────────────────────────────────────────────────── */}
      {isQuestionOpen && (
        <AskQuestionModal
          shipmentId={shipment._id}
          onClose={() => setIsQuestionOpen(false)}
        />
      )}
      {isOfferOpen && (
        <OfferSubmitModal
          shipment={shipment}
          onClose={() => setIsOfferOpen(false)}
          onSuccess={handleQuoteSuccess}
        />
      )}
    </div>
  );
};

export default ShipmentDetails;
