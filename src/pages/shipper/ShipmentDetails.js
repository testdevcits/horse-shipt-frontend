import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { validateShipmentQueryToken } from "../../utils/createQueryToken";
import { SlLocationPin } from "react-icons/sl";
import { LuCalendarDays, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { FiChevronDown, FiChevronUp, FiMail } from "react-icons/fi";
import { MdChat, MdHelpOutline } from "react-icons/md";
import { BiMapPin, BiRocket } from "react-icons/bi";
import { useShipperShipment } from "../../contexts/shipperContext/ShipperShipmentContext";
import OfferSubmitModal from "./OfferSubmitModal";
import { getPublishedTime } from "../../utils/timeAgo";
import AskQuestionModal from "./AskQuestionModal";
import RouteMap from "./common/RouteMap";
import { IoArrowBack } from "react-icons/io5";

/**
 * ============================================================
 * COMPLETE MODERN SHIPMENT DETAILS PAGE
 * With image carousel, full responsiveness, all features
 * ============================================================
 */

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

  const idToUse = shipmentIdFromQuery || paramId || defaultId;

  /**
   * ================= VALIDATION & TIMEOUT =================
   */
  useEffect(() => {
    if (!validateShipmentQueryToken(tokenFromQuery, idToUse)) {
      navigate("/shipper/dashboard", { replace: true });
      return;
    }

    try {
      const decoded = JSON.parse(atob(tokenFromQuery));
      const timeLeft = decoded.exp - Date.now();

      if (timeLeft > 0) {
        const timer = setTimeout(() => {
          navigate("/shipper/dashboard", { replace: true });
        }, timeLeft);

        return () => clearTimeout(timer);
      } else {
        navigate("/shipper/dashboard", { replace: true });
      }
    } catch (error) {
      navigate("/shipper/dashboard", { replace: true });
    }
  }, [tokenFromQuery, idToUse, navigate]);

  /**
   * ================= FETCH SHIPMENTS =================
   */
  useEffect(() => {
    if (!shipments.length) getAvailableShipments();
  }, [shipments.length, getAvailableShipments]);

  /**
   * ================= FIND SHIPMENT =================
   */
  useEffect(() => {
    if (!idToUse || !shipments.length) return;
    const foundShipment = shipments.find(
      (s) => String(s._id) === String(idToUse)
    );
    setShipment(foundShipment || null);
    if (foundShipment) {
      setExpandedHorse(0);
    }
  }, [idToUse, shipments]);

  /**
   * ================= IMAGE CAROUSEL HANDLERS =================
   */
  const getHorseImages = (horseId) => {
    if (!shipment) return [];
    const horse = shipment.horses.find((h) => h._id === horseId);
    const images = [];

    if (horse?.photo?.url) {
      images.push({
        url: horse.photo.url,
        type: "Main Photo",
      });
    }

    if (horse?.documents?.coggins?.url) {
      images.push({
        url: horse.documents.coggins.url,
        type: "Coggins",
      });
    }

    if (horse?.documents?.healthCertificate?.url) {
      images.push({
        url: horse.documents.healthCertificate.url,
        type: "Health Cert",
      });
    }

    if (horse?.documents?.other?.url) {
      images.push({
        url: horse.documents.other.url,
        type: "Other Docs",
      });
    }

    return images.length > 0
      ? images
      : [
          {
            url: "https://via.placeholder.com/400?text=No+Images",
            type: "Placeholder",
          },
        ];
  };

  const currentImages =
    expandedHorse !== null
      ? getHorseImages(shipment?.horses[expandedHorse]?._id)
      : [];
  const currentImageIndex = horseImageIndex[expandedHorse] || 0;

  const handleNextImage = (e, index, imagesLength) => {
    e.stopPropagation();
    setHorseImageIndex((prev) => ({
      ...prev,
      [index]: ((prev[index] || 0) + 1) % imagesLength,
    }));
  };

  const handlePrevImage = (e, index, imagesLength) => {
    e.stopPropagation();
    setHorseImageIndex((prev) => ({
      ...prev,
      [index]: ((prev[index] || 0) - 1 + imagesLength) % imagesLength,
    }));
  };

  /**
   * ================= FORMAT DATE =================
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /**
   * ================= LOADING STATE =================
   */
  if (loading) {
    return (
      <div className="flex items-center font-montserrat justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#BF9B53] to-[#9d7d42] flex items-center justify-center">
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

  /**
   * ================= NOT FOUND STATE =================
   */
  if (!shipment) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-montserrat">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-7xl mb-6">⚠️</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Shipment Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The shipment you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/shipper/dashboard")}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#BF9B53] to-[#9d7d42] text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  /**
   * ================= RENDER =================
   */
  return (
    <div className="font-montserrat w-full min-h-screen">
      {/* ===================== HEADER SECTION ===================== */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
                Shipment Details
              </h1>
              <div className="inline-block bg-gradient-to-r from-[#BF9B53] to-[#9d7d42] text-white px-4 py-1.5 rounded-sm text-sm font-bold">
                {shipment.shipmentCode}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Listed{" "}
                <span className="font-semibold text-gray-900">
                  {getPublishedTime(shipment.publishedAt)}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                by{" "}
                <span className="font-semibold text-gray-900">
                  {shipment.customer?.name}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== MAIN CONTENT ===================== */}
      <div className="max-w-full mx-auto mt-8 space-y-8 ">
        {/* ===================== HERO SECTION - ROUTE ===================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Horse Carousel */}
          <div className="lg:col-span-1">
            <div className="relative overflow-hidden rounded-md border-2 border-yellow-200 shadow-xl bg-white group">
              <img
                src={
                  shipment.horses[0]?.photo?.url ||
                  "https://via.placeholder.com/400?text=Horse"
                }
                alt={shipment.horses[0]?.registeredName}
                className="w-full h-[340px] sm:h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400?text=Horse+Image";
                }}
              />

              {/* Badge */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-full text-sm font-bold text-gray-900 shadow-md">
                Horse 1 of {shipment.numberOfHorses}
              </div>

              {/* Status Badge */}
              <div className="absolute bottom-4 left-4 bg-gradient-to-r from-[#BF9B53] to-[#9d7d42] text-white px-4 py-2 rounded-full text-xs font-bold uppercase shadow-md">
                {shipment.status?.replace("_", " ")}
              </div>
            </div>
            {/* ================= MAP VIEW ================= */}
            <div className="mt-6">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">
                Route Map
              </p>

              <div className="w-full rounded-md overflow-hidden border-2 border-yellow-200">
                <RouteMap
                  pickup={shipment.pickupLocation}
                  delivery={shipment.deliveryLocation}
                />
              </div>
            </div>
          </div>

          {/* MIDDLE & RIGHT: Route & Info */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* ===================== ROUTE CARD ===================== */}
            <div className="bg-white rounded-md border-2 border-yellow-200 p-6 sm:p-8 shadow-md hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-2">
                <BiMapPin className="text-[#BF9B53]" size={28} />
                Route Information
              </h2>

              <div className="space-y-8">
                {/* Pickup */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-300">
                      <SlLocationPin size={24} className="text-yellow-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                      Pickup Location
                    </p>
                    <p className="text-base sm:text-lg font-bold text-gray-900 mb-3 leading-snug">
                      {shipment.pickupLocation}
                    </p>
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 bg-blue-50 w-fit px-3 py-2 rounded-lg">
                      <LuCalendarDays size={16} />
                      {formatDate(shipment.pickupDate)}
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center py-2">
                  <div className="w-1 h-12 bg-gradient-to-b from-gray-300 to-transparent rounded-full" />
                </div>

                {/* Delivery */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-300">
                      <BiRocket size={24} className="text-yellow-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                      Delivery Location
                    </p>
                    <p className="text-base sm:text-lg font-bold text-gray-900 mb-3 leading-snug">
                      {shipment.deliveryLocation}
                    </p>
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 bg-green-50 w-fit px-3 py-2 rounded-lg">
                      <LuCalendarDays size={16} />
                      {formatDate(shipment.deliveryDate)}
                    </div>
                  </div>
                </div>

                {/* Distance */}
                <div className="pt-6 border-t-2 border-yellow-200 mt-4">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">
                    Total Distance
                  </p>
                  <div className="flex items-end gap-3">
                    <span className="text-5xl font-black bg-gradient-to-r from-[#BF9B53] to-[#9d7d42] bg-clip-text text-transparent">
                      {shipment.estimatedDistance?.miles || 200}
                    </span>
                    <div>
                      <span className="text-gray-700 font-bold text-lg">
                        miles
                      </span>
                      {shipment.estimatedDistance && (
                        <p className="text-sm text-gray-500 font-semibold">
                          ({shipment.estimatedDistance.km} km)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===================== CUSTOMER & STATS GRID ===================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Info */}
              <div className="bg-white rounded-md border-2 border-yellow-200 p-6 shadow-md hover:shadow-lg transition-all duration-300">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-4">
                  Customer Info
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                      Name
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {shipment.customer?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-yellow-50 p-3 rounded-lg">
                    <FiMail size={18} className="text-gray-600 flex-shrink-0" />
                    <p className="text-sm font-semibold text-gray-600 break-all">
                      {shipment.customer?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-md border-2 border-yellow-200 p-4 shadow-md">
                  <p className="text-xs font-black text-yellow-600 uppercase mb-2">
                    Horses
                  </p>
                  <p className="text-4xl font-black text-gray-700">
                    {shipment.numberOfHorses}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-md border-2 border-yellow-200 p-4 shadow-md">
                  <p className="text-xs font-black text-yellow-600 uppercase mb-2">
                    Status
                  </p>
                  <p className="text-xs font-bold text-orange-900 capitalize">
                    {shipment.status?.replace("_", " ")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ===================== HORSES DETAILS ACCORDION ===================== */}
        <div className="bg-white rounded-md border-2 border-gray-200 shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#BF9B53]/10 to-transparent p-6 sm:p-8 border-b-2 border-gray-200">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
              Horse Details
              <span className="text-lg bg-[#BF9B53] text-white px-3 py-1 rounded-full">
                {shipment.numberOfHorses}
              </span>
            </h2>
          </div>

          {/* Horses List */}
          <div className="divide-y-2 divide-gray-200">
            {shipment.horses.map((horse, index) => (
              <div key={horse._id} className="overflow-hidden">
                {/* Horse Header - Always Visible */}
                <div
                  onClick={() =>
                    setExpandedHorse(expandedHorse === index ? null : index)
                  }
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 bg-gray-50 hover:bg-[#BF9B53]/5 cursor-pointer transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-gray-200 group-hover:border-[#BF9B53] transition-colors shadow-md">
                      <img
                        src={
                          horse.photo?.url || "https://via.placeholder.com/80"
                        }
                        alt={horse.registeredName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/80?text=Horse";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                        {horse.registeredName}
                      </h3>
                      <p className="text-sm text-gray-600 font-semibold">
                        Barn Name:{" "}
                        <span className="text-gray-900">{horse.barnName}</span>
                      </p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-bold">
                          {horse.breed}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-lg font-bold">
                          {horse.sex}
                        </span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg font-bold">
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

                {/* Horse Details - Expandable */}
                {expandedHorse === index && (
                  <div className="p-6 sm:p-8 bg-white space-y-8">
                    {/* Image Carousel */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-black text-gray-500 uppercase tracking-wider">
                        Photos & Documents
                      </h4>
                      {currentImages.length > 0 ? (
                        <div className="relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-gray-100">
                          <img
                            src={currentImages[currentImageIndex]?.url}
                            alt={currentImages[currentImageIndex]?.type}
                            className="w-full h-64 sm:h-80 object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/600x400?text=Image+Not+Available";
                            }}
                          />

                          {/* Image Info */}
                          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-full text-sm font-bold text-gray-900 shadow-md">
                            {currentImages[currentImageIndex]?.type}
                          </div>

                          {/* Image Counter */}
                          <div className="absolute bottom-4 right-4 bg-gray-900/80 text-white px-3 py-1 rounded-full text-xs font-bold">
                            {currentImageIndex + 1} of {currentImages.length}
                          </div>

                          {/* Navigation Buttons */}
                          {currentImages.length > 1 && (
                            <>
                              <button
                                onClick={handlePrevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10"
                                title="Previous image"
                              >
                                <LuChevronLeft size={24} />
                              </button>
                              <button
                                onClick={handleNextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10"
                                title="Next image"
                              >
                                <LuChevronRight size={24} />
                              </button>
                            </>
                          )}

                          {/* Image Dots */}
                          {currentImages.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-gray-900/50 px-4 py-2 rounded-full backdrop-blur">
                              {currentImages.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setHorseImageIndex({
                                      ...horseImageIndex,
                                      [expandedHorse]: idx,
                                    });
                                  }}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    idx === currentImageIndex
                                      ? "bg-white w-6"
                                      : "bg-white/50 hover:bg-white/75"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-64 sm:h-80 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-500 font-semibold">
                          No images available
                        </div>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-6">
                      <h4 className="text-sm font-black text-gray-500 uppercase tracking-wider">
                        Horse Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <p className="text-xs font-black text-gray-500 uppercase mb-2">
                            Breed :-
                          </p>
                          <p className="text-lg font-bold text-[#BF9B53]">
                            {horse.breed}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-black text-gray-500 uppercase mb-2">
                            Color :-
                          </p>
                          <p className="text-lg font-bold text-[#BF9B53]">
                            {horse.colour}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-black text-gray-500 uppercase mb-2">
                            Age :-
                          </p>
                          <p className="text-lg font-bold text-[#BF9B53]">
                            {horse.age} years old :-
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-black text-gray-500 uppercase mb-2">
                            Sex :-
                          </p>
                          <p className="text-lg font-bold text-[#BF9B53]">
                            {horse.sex}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-black text-gray-500 uppercase mb-2">
                            Stall Size :-
                          </p>
                          <p className="text-lg font-bold text-[#BF9B53]">
                            {horse.requestedStallSize}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-black text-gray-500 uppercase mb-2">
                            Registered Name :-
                          </p>
                          <p className="text-lg font-bold text-[#BF9B53]">
                            {horse.registeredName}
                          </p>
                        </div>
                      </div>

                      {/* General Info */}
                      {horse.generalInfo && (
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-md p-6">
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
            ))}
          </div>
        </div>
        {/* ===================== ACTION BUTTONS ===================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setIsOfferOpen(true)}
            className="relative group bg-gradient-to-r from-[#BF9B53] to-[#9d7d42] text-white px-6 py-4 rounded-md font-black text-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 overflow-hidden"
          >
            <span className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
            <span className="relative">Submit an Offer</span>
          </button>

          <button
            onClick={() =>
              navigate(`/shipper/chat?customerId=${shipment.customer?._id}`)
            }
            className="border-2 border-[#BF9B53] text-[#BF9B53] px-6 py-4 rounded-md font-black text-lg hover:bg-[#BF9B53]/5 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 bg-white"
          >
            <MdChat size={22} />
            Chat with Customer
          </button>
        </div>

        {/* ===================== ASK QUESTION BUTTON ===================== */}
        <button
          onClick={() => setIsQuestionOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-md font-bold hover:border-[#BF9B53] hover:text-[#BF9B53] hover:bg-[#BF9B53]/5 transition-all duration-300"
        >
          <MdHelpOutline size={22} />
          Ask a Question
        </button>

        {/* ===================== SPACER ===================== */}
        <div className="h-8" />
      </div>
      <button
        onClick={() => navigate(-1)}
        className="fixed bottom-6 right-6 bg-gray-600 text-white p-3 rounded-full shadow-lg hover:bg-[#BF9B53] transition"
      >
        <IoArrowBack className="w-5 h-5" />
      </button>

      {/* ===================== MODALS ===================== */}
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
        />
      )}
    </div>
  );
};

export default ShipmentDetails;
