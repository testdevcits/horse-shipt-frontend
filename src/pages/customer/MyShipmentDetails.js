import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { SlLocationPin } from "react-icons/sl";
import { LuCalendarDays, LuCircleChevronRight } from "react-icons/lu";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

import { useCustomerShipments } from "../../contexts/customerContext/CustomerShipmentContext";
import { useCustomerQuote } from "../../contexts/customerContext/CustomerQuoteContext";
import { useCustomerQuestions } from "../../contexts/customerContext/CustomerQuestionContext";

import PageLoader from "../../components/common/PageLoader";
import AcceptQuoteModal from "./AcceptQuoteModal";
import Toast from "../../components/common/Toast";
import ShipmentQuestions from "./ShipmentQuestions";

// ---------------- STRIPE ----------------
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Replace with your Stripe test key
const stripePromise = loadStripe(
  "pk_test_51T6oVICVoPk11ijL51FMIuNhin8FIjyoJSOITwlK6AqEutL9Jl4bwdOrhziWtZdaBesLZSJheByHGV5RNHbMrYfH00yf77nS4r"
);

const MyShipmentDetails = () => {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get("shipmentId");
  const shipmentId = paramId || queryId;
  const navigate = useNavigate();

  const {
    fetchShipmentById,
    currentShipment,
    loading: shipmentLoading,
    publishShipment,
    deleteShipment,
  } = useCustomerShipments();

  const {
    quotes,
    getQuotesByShipment,
    loading: quotesLoading,
  } = useCustomerQuote();

  const { questions, fetchQuestions } = useCustomerQuestions();

  const [activeTab, setActiveTab] = useState("overview");
  const [openDetails, setOpenDetails] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "", visible: false });

  // ---------------- FETCH SHIPMENT ----------------
  const fetchData = useCallback(() => {
    if (!shipmentId) return;
    fetchShipmentById(shipmentId);
  }, [shipmentId, fetchShipmentById]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loading = shipmentLoading || quotesLoading;
  const shipment = currentShipment;

  // ---------------- TOAST ----------------
  const showToast = (message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  };

  const handleDeleteClick = (id) => {
    setSelectedShipmentId(id);
    setShowDeleteModal(true);
  };
  // ---------------- PUBLISH SHIPMENT ----------------
  const handlePublishShipment = async () => {
    try {
      await publishShipment(shipment._id);
      showToast("Shipment published successfully", "success");
    } catch (err) {
      showToast(err.message || "Failed to publish shipment", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedShipmentId) return;

    await deleteShipment(selectedShipmentId);

    setShowDeleteModal(false);
    setSelectedShipmentId(null);

    // Optional redirect
    navigate("/customer/dashboard");
  };

  const handleReviewNavigate = () => {
    const shipperId =
      quotes?.[0]?.shipper?._id ||
      shipment?.shipperId ||
      shipment?.shipper?._id;

    if (!shipperId) {
      alert("Shipper ID not found");
      return;
    }

    navigate(`/customer/reviews/${shipperId}`);
  };

  // ---------------- TAB BUTTON ----------------
  const handleTabClick = (id) => {
    setActiveTab(id);

    if (id === "quotes" && shipmentId) getQuotesByShipment(shipmentId, true);

    if (id === "questions" && shipmentId) fetchQuestions(shipmentId);
  };

  const TabButton = ({ id, label, count }) => (
    <button
      onClick={() => handleTabClick(id)}
      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 font-medium text-xs sm:text-sm border-b-2 transition-all duration-200
        ${
          activeTab === id
            ? "border-[#BF9B53] text-[#BF9B53]"
            : "border-transparent text-gray-600 hover:text-black rounded-full"
        }`}
    >
      <span className="truncate">{label}</span>
      {count !== undefined && (
        <span
          className="flex items-center justify-center w-[25px] h-[24px] text-[10px] sm:text-xs font-medium 
                     bg-[#F2EBDD] border border-[#BF9B53] rounded-full"
        >
          {count}
        </span>
      )}
    </button>
  );

  if (loading)
    return (
      <PageLoader
        text="Loading shipment Quotes details..."
        fullScreen={false}
      />
    );
  if (!shipment)
    return <p className="text-red-500 text-center mt-8">Shipment not found.</p>;

  return (
    <div className="w-full font-montserrat relative">
      {/* ================= TOAST ================= */}
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "", visible: false })}
        />
      )}

      <h2 className="font-semibold text-2xl md:text-3xl mb-6 uppercase">
        Shipment_ID :{" "}
        <span className="text-[#BF9B53]">{shipment.shipmentCode}</span>
      </h2>

      {/* ================= TABS ================= */}
      <div className="flex gap-6 border-b mb-6">
        <TabButton id="overview" label="Overview" />
        <TabButton id="quotes" label="Quotes" count={quotes.length} />
        <TabButton
          id="questions"
          label="Questions"
          count={questions.answered.length + questions.pending.length}
        />
      </div>

      {/* ================= OVERVIEW TAB ================= */}
      {activeTab === "overview" && shipment && (
        <div className="flex flex-col gap-6 font-montserrat text-sm">
          {/* ---------------- TOP CARD ---------------- */}
          <div className="bg-white border border-[#BF9B53] rounded-[10px]">
            <div className="flex flex-col md:flex-row gap-4 p-4 md:gap-8">
              <div className="order-1 md:order-2 w-full md:w-[60%]">
                <img
                  src={shipment.horses?.[0]?.photo?.url || "/placeholder.png"}
                  alt="Shipment"
                  className="w-full h-[220px] sm:h-[280px] md:h-[382px] object-cover rounded-md"
                />
              </div>
              <div className="order-2 md:order-1 w-full md:w-[40%] flex flex-col gap-8">
                {/* PICKUP */}
                <div className="flex flex-col gap-1">
                  <h4 className="text-gray-500 font-medium">Pickup Info</h4>
                  <p className="flex items-center gap-2 text-gray-700">
                    <SlLocationPin /> {shipment.pickupLocation}
                  </p>
                  <p className="flex items-center gap-2 text-gray-700">
                    <LuCalendarDays />
                    {new Date(shipment.pickupDate).toLocaleDateString()}
                  </p>
                </div>

                {/* DELIVERY */}
                <div className="flex flex-col gap-1">
                  <h4 className="text-gray-500 font-medium">Delivery Info</h4>
                  <p className="flex items-center gap-2 text-gray-700">
                    <SlLocationPin /> {shipment.deliveryLocation}
                  </p>
                  <p className="flex items-center gap-2 text-gray-700">
                    <LuCalendarDays />
                    {new Date(shipment.deliveryDate).toLocaleDateString()}
                  </p>
                </div>

                {/* STATUS */}
                <div className="flex flex-col gap-1">
                  <h4 className="text-gray-500 font-medium">Shipment Status</h4>
                  <p className="font-semibold capitalize text-system-primary">
                    {shipment.status.replaceAll("_", " ")}
                  </p>
                </div>

                {!shipment.publish && shipment.status === "pending" && (
                  <div className="flex gap-3 mt-4">
                    {/* Publish Button */}
                    <button
                      onClick={handlePublishShipment}
                      className="px-6 py-3 bg-system-primary text-white rounded-lg font-medium hover:opacity-90 transition"
                    >
                      Publish Shipment
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteClick(shipment._id)}
                      className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
                    >
                      Delete Shipment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ---------------- DETAILS ---------------- */}
          <div className="border border-[#BF9B53] rounded-[10px] p-4">
            <div
              onClick={() => setOpenDetails(!openDetails)}
              className="flex items-center justify-between h-[44px] p-[14px] bg-[#F2EBDD] rounded-[8px] cursor-pointer"
            >
              <h2 className="text-[16px] font-medium text-[#333333]">
                Shipment Details
              </h2>
              {openDetails ? (
                <FiChevronUp size={20} />
              ) : (
                <FiChevronDown size={20} />
              )}
            </div>
            {showDeleteModal && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
                <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
                  {/* Title */}
                  <h2 className="text-xl font-semibold mb-2">
                    Delete Shipment
                  </h2>

                  {/* Message */}
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete this shipment? This action
                    cannot be undone.
                  </p>

                  {/* Buttons */}
                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="w-full px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleConfirmDelete}
                      className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
            {openDetails && (
              <div className="p-4 space-y-6">
                {/* GENERAL */}
                <div className="flex gap-6">
                  <div className="w-1/4 text-gray-800 font-medium">
                    GENERAL DETAILS
                  </div>
                  <div className="w-3/4 text-gray-700 flex flex-col gap-1">
                    <span>Total Horses: {shipment.horses.length}</span>
                    <span>
                      <strong>Pickup:</strong>{" "}
                      {new Date(shipment.pickupDate).toLocaleDateString()} -{" "}
                      {shipment.pickupTimeOption}
                    </span>
                    <span>
                      <strong>Delivery:</strong>{" "}
                      {new Date(shipment.deliveryDate).toLocaleDateString()} -{" "}
                      {shipment.deliveryTimeOption}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-300" />

                {/* HORSES */}
                {shipment.horses.map((horse, index) => (
                  <div key={horse._id} className="flex gap-6">
                    <div className="w-1/4 text-gray-800 font-medium">
                      HORSE {index + 1}
                    </div>
                    <div className="w-3/4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                      <div>
                        <span className="text-gray-500">Registered Name:</span>{" "}
                        {horse.registeredName}
                      </div>
                      <div>
                        <span className="text-gray-500">Barn Name:</span>{" "}
                        {horse.barnName}
                      </div>
                      <div>
                        <span className="text-gray-500">Breed:</span>{" "}
                        {horse.breed}
                      </div>
                      <div>
                        <span className="text-gray-500">Colour:</span>{" "}
                        {horse.colour}
                      </div>
                      <div>
                        <span className="text-gray-500">Age:</span> {horse.age}
                      </div>
                      <div>
                        <span className="text-gray-500">Sex:</span> {horse.sex}
                      </div>
                      {horse.generalInfo && (
                        <div className="sm:col-span-2">
                          <span className="text-gray-500">General Info:</span>{" "}
                          {horse.generalInfo}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= QUOTES TAB ================= */}
      {activeTab === "quotes" && (
        <div className="bg-white border border-[#BF9B53] rounded-lg p-6 relative">
          <h3 className="font-medium mb-4">Total Quotes: {quotes.length}</h3>
          {quotes.length === 0 ? (
            <p className="text-gray-500 text-center">No quotes received yet.</p>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <div
                  key={quote._id}
                  className="border rounded-lg p-4 flex justify-between items-center relative"
                >
                  <div>
                    <p className="font-medium">
                      {quote.shipper?.companyName || quote.shipper?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Price (USD): ${quote.totalPrice} • {quote.status}
                    </p>
                  </div>

                  <LuCircleChevronRight
                    size={22}
                    className="text-system-primary cursor-pointer hover:scale-110 transition absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setSelectedQuote(quote)}
                  />
                </div>
              ))}
              <button
                onClick={handleReviewNavigate}
                className="text-system-primary hover:opacity-80 transition text-sm font-medium bg-transparent border-none p-0 cursor-pointer"
              >
                View Shipper Reviews
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= QUESTIONS TAB ================= */}
      {activeTab === "questions" && (
        <div className="mt-6">
          <ShipmentQuestions shipmentId={shipmentId} />
        </div>
      )}

      {/* ================= ACCEPT QUOTE MODAL WITH STRIPE ================= */}
      {selectedQuote && (
        <Elements stripe={stripePromise}>
          <AcceptQuoteModal
            quote={selectedQuote}
            onClose={() => setSelectedQuote(null)}
          />
        </Elements>
      )}
    </div>
  );
};

export default MyShipmentDetails;
