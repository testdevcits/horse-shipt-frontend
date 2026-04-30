import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { SlLocationPin } from "react-icons/sl";
import { LuCalendarDays } from "react-icons/lu";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

import { useCustomerShipments } from "../../contexts/customerContext/CustomerShipmentContext";
import { useCustomerQuote } from "../../contexts/customerContext/CustomerQuoteContext";
import { useCustomerQuestions } from "../../contexts/customerContext/CustomerQuestionContext";

import PageLoader from "../../components/common/PageLoader";
import AcceptQuoteModal from "./AcceptQuoteModal";
import Toast from "../../components/common/Toast";
import ShipmentQuestions from "./ShipmentQuestions";
import ShipmentQuotes from "./Shipmentquotes";
import FindShippers from "./FindShippers";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

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
    totalQuotes,
    currentPage,
    totalPages,
    getQuotesByShipment,
    loading: quotesLoading,
  } = useCustomerQuote();

  const { questions, fetchQuestions } = useCustomerQuestions();

  const [activeTab, setActiveTab] = useState("overview");
  const [openDetails, setOpenDetails] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const showToast = (message, type = "info") => {
    Toast[type](message);
  };

  const fetchData = useCallback(() => {
    if (!shipmentId) return;
    fetchShipmentById(shipmentId);
  }, [shipmentId, fetchShipmentById]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loading = shipmentLoading;
  const shipment = currentShipment;

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const getPickupDates = () => {
    if (shipment?.pickupDateRange) {
      return {
        startDate: formatDate(shipment.pickupDateRange.start),
        endDate: formatDate(shipment.pickupDateRange.end),
      };
    }
    return {
      startDate: formatDate(shipment?.pickupDate),
      endDate: formatDate(shipment?.pickupDate),
    };
  };

  const getDeliveryDates = () => {
    if (shipment?.deliveryDateRange) {
      return {
        startDate: formatDate(shipment.deliveryDateRange.start),
        endDate: formatDate(shipment.deliveryDateRange.end),
      };
    }
    return {
      startDate: formatDate(shipment?.deliveryDate),
      endDate: formatDate(shipment?.deliveryDate),
    };
  };

  const handleDeleteClick = (id) => {
    setSelectedShipmentId(id);
    setShowDeleteModal(true);
  };

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
    navigate("/customer/dashboard");
  };

  const handleEditMetadata = () => {
    navigate(`/customer/new-shipment/${shipment._id}`, {
      state: {
        editMode: true,
        metadataOnly: true,
        shipment,
      },
    });
  };

  const handleTabClick = (id) => {
    setActiveTab(id);
    if (id === "quotes" && shipmentId)
      getQuotesByShipment(shipmentId, true, 1, 5);
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
        <span className="flex items-center justify-center w-[25px] h-[24px] text-[10px] sm:text-xs font-medium bg-[#F2EBDD] border border-[#BF9B53] rounded-full">
          {count}
        </span>
      )}
    </button>
  );

  if (loading)
    return <PageLoader text="Loading shipment details..." fullScreen={false} />;

  if (!shipment)
    return (
      <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-md text-gray-400">Shipment not found</p>
      </div>
    );

  const pickupDates = getPickupDates();
  const deliveryDates = getDeliveryDates();

  return (
    <div className="w-full font-montserrat relative">
      <h2 className="font-semibold text-2xl md:text-3xl mb-6 uppercase">
        Shipment_ID :{" "}
        <span className="text-[#BF9B53]">{shipment.shipmentCode}</span>
      </h2>
      <div className="flex gap-6 border-b mb-6">
        <TabButton id="overview" label="Overview" />
        <TabButton
          id="quotes"
          label="Quotes"
          count={totalQuotes ?? quotes.length}
        />
        <TabButton
          id="questions"
          label="Questions"
          count={questions.answered.length + questions.pending.length}
        />
        <TabButton id="find-shippers" label="Find Shipper" />
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
                    {pickupDates.startDate} - {pickupDates.endDate}
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
                    {deliveryDates.startDate} - {deliveryDates.endDate}
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
                    <button
                      onClick={() => setShowPublishModal(true)}
                      className="px-6 py-3 bg-system-primary text-white rounded-lg font-medium hover:opacity-90 transition"
                    >
                      Publish Shipment
                    </button>
                    <button
                      onClick={() => handleDeleteClick(shipment._id)}
                      className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
                    >
                      Delete Shipment
                    </button>
                  </div>
                )}

                {shipment.publish &&
                  !["delivered", "cancelled"].includes(shipment.status) && (
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleEditMetadata}
                        className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-[#BF9B53] transition"
                      >
                        Edit Documents & Notes
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
                  <h2 className="text-xl font-semibold mb-2">
                    Delete Shipment
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete this shipment? This action
                    cannot be undone.
                  </p>
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
                      <strong>Pickup:</strong> {pickupDates.startDate} -{" "}
                      {pickupDates.endDate}
                      {shipment.pickupTimeOption && (
                        <span className="ml-2">
                          ({shipment.pickupTimeOption})
                        </span>
                      )}
                    </span>
                    <span>
                      <strong>Delivery:</strong> {deliveryDates.startDate} -{" "}
                      {deliveryDates.endDate}
                      {shipment.deliveryTimeOption && (
                        <span className="ml-2">
                          ({shipment.deliveryTimeOption})
                        </span>
                      )}
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
                      {(horse.notesLog?.length > 0 || horse.notes) && (
                        <div className="sm:col-span-2">
                          <span className="text-gray-500">
                            Chronological Notes:
                          </span>
                          <div className="mt-2 space-y-2">
                            {(horse.notesLog?.length
                              ? horse.notesLog
                              : [{ note: horse.notes }]
                            ).map((entry, noteIdx) => (
                              <div
                                key={noteIdx}
                                className="rounded-sm border border-gray-200 bg-gray-50 p-3"
                              >
                                <div className="flex flex-wrap justify-between gap-2 text-xs text-gray-500">
                                  <span className="font-semibold">
                                    {entry.userName || "Customer"}
                                  </span>
                                  {entry.createdAt && (
                                    <span>
                                      {new Date(
                                        entry.createdAt
                                      ).toLocaleString()}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                                  {entry.note}
                                </p>
                              </div>
                            ))}
                          </div>
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
        <div className="mt-6">
          <ShipmentQuotes
            quotes={quotes}
            loading={quotesLoading}
            onSelectQuote={setSelectedQuote}
            shipment={shipment}
            shipmentId={shipmentId}
            totalQuotes={totalQuotes}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      )}

      {/* ================= QUESTIONS TAB ================= */}
      {activeTab === "questions" && (
        <div className="mt-6">
          <ShipmentQuestions shipmentId={shipmentId} />
        </div>
      )}

      {activeTab === "find-shippers" && (
        <div className="mt-6">
          <FindShippers shipmentId={shipmentId} shipment={shipment} />
        </div>
      )}

      {/* ================= ACCEPT QUOTE MODAL ================= */}
      {selectedQuote && (
        <Elements stripe={stripePromise}>
          <AcceptQuoteModal
            quote={selectedQuote}
            onClose={() => setSelectedQuote(null)}
          />
        </Elements>
      )}

      {/* ================= PUBLISH MODAL ================= */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-md shadow-lg p-6 relative">
            <h2 className="text-xl font-semibold mb-2">Confirm Publish</h2>
            <p className="text-gray-600 mb-4">
              Once you publish this shipment, you{" "}
              <strong>cannot delete or edit</strong> it. Are you sure you want
              to proceed?
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowPublishModal(false)}
                className="w-full px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handlePublishShipment();
                  setShowPublishModal(false);
                }}
                className="w-full px-4 py-2 bg-system-primary text-white rounded-md hover:opacity-90 transition"
              >
                Yes, Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyShipmentDetails;
