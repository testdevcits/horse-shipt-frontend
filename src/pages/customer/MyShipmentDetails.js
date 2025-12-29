import React, { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { SlLocationPin } from "react-icons/sl";
import { LuCalendarDays, LuCircleChevronRight } from "react-icons/lu";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

import { useCustomerShipments } from "../../contexts/customerContext/CustomerShipmentContext";
import { useCustomerQuote } from "../../contexts/customerContext/CustomerQuoteContext";
import PageLoader from "../../components/common/PageLoader";
import Toast from "../../components/common/Toast";
import AcceptQuoteModal from "./AcceptQuoteModal";

const MyShipmentDetails = () => {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get("shipmentId");
  const shipmentId = paramId || queryId;

  const {
    fetchShipmentById,
    currentShipment,
    loading: shipmentLoading,
  } = useCustomerShipments();
  const {
    quotes,
    getQuotesByShipment,
    loading: quotesLoading,
  } = useCustomerQuote();

  const [activeTab, setActiveTab] = useState("overview");
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "", visible: false });

  const fetchData = useCallback(() => {
    if (!shipmentId) return;
    fetchShipmentById(shipmentId);
    getQuotesByShipment(shipmentId);
  }, [shipmentId, fetchShipmentById, getQuotesByShipment]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loading = shipmentLoading || quotesLoading;

  if (loading)
    return <PageLoader text="Loading shipment details..." fullScreen={false} />;

  if (!currentShipment)
    return <p className="text-red-500 text-center mt-8">Shipment not found.</p>;

  const shipment = currentShipment;

  const TabButton = ({ id, label, count }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 font-medium text-sm border-b-2 ${
        activeTab === id
          ? "border-[#BF9B53] text-[#BF9B53]"
          : "border-transparent text-gray-500 hover:text-black"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="w-full font-montserrat relative">
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "", visible: false })}
        />
      )}

      <h2 className="font-semibold text-2xl md:text-3xl mb-6">
        Shipment Details
      </h2>

      <div className="flex gap-6 border-b mb-6">
        <TabButton id="overview" label="Overview" />
        <TabButton id="quotes" label="Quotes" count={quotes.length} />
        <TabButton id="questions" label="Questions" />
      </div>

      {/* ===================== OVERVIEW TAB ===================== */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          <div className="bg-white border rounded-lg p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-[60%]">
                <img
                  src={shipment.horses[0]?.photo?.url}
                  alt="shipment"
                  className="w-full h-[220px] md:h-[360px] object-cover rounded-md"
                />
              </div>
              <div className="w-full md:w-[40%] flex flex-col gap-6">
                <div>
                  <h4 className="text-gray-500 text-sm mb-1">Pickup Info</h4>
                  <p className="flex items-center gap-2">
                    <SlLocationPin /> {shipment.pickupLocation}
                  </p>
                  <p className="flex items-center gap-2">
                    <LuCalendarDays />{" "}
                    {new Date(shipment.pickupDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-gray-500 text-sm mb-1">Delivery Info</h4>
                  <p className="flex items-center gap-2">
                    <SlLocationPin /> {shipment.deliveryLocation}
                  </p>
                  <p className="flex items-center gap-2">
                    <LuCalendarDays />{" "}
                    {new Date(shipment.deliveryDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-gray-500 text-sm mb-1">
                    Shipment Status
                  </h4>
                  <p className="font-semibold capitalize">{shipment.status}</p>
                </div>
              </div>
            </div>
          </div>

          {/* SHIPMENT DETAILS */}
          <div className="border rounded-lg p-4">
            <div
              onClick={() => setOpenDetails(!openDetails)}
              className="flex justify-between items-center bg-[#F2EBDD] p-3 rounded-md cursor-pointer"
            >
              <h3 className="font-medium">Shipment Details</h3>
              {openDetails ? <FiChevronUp /> : <FiChevronDown />}
            </div>

            {openDetails && (
              <div className="mt-4 space-y-6">
                {shipment.horses.map((horse, index) => (
                  <div
                    key={horse._id}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm"
                  >
                    <p>
                      <strong>Horse {index + 1}:</strong> {horse.registeredName}
                    </p>
                    <p>Breed: {horse.breed}</p>
                    <p>Colour: {horse.colour}</p>
                    <p>Age: {horse.age}</p>
                    <p>Sex: {horse.sex}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== QUOTES TAB ===================== */}
      {activeTab === "quotes" && (
        <div className="bg-white border rounded-lg p-6 relative">
          {quotes.length === 0 ? (
            <p className="text-gray-500 text-center">No quotes received yet.</p>
          ) : (
            <>
              <h3 className="text-lg font-medium mb-4">
                Total quotes: {quotes.length}
              </h3>

              <div className="grid grid-cols-2 gap-4 border-b pb-2 mb-2 text-sm font-medium text-gray-600">
                <span>Service Provider</span>
                <span>Price (USD)</span>
              </div>

              <div className="space-y-2">
                {quotes.map((quote) => (
                  <div
                    key={quote._id}
                    className="grid grid-cols-2 gap-4 items-center p-3 border rounded-md relative hover:shadow-sm transition"
                  >
                    <span>
                      {quote.shipper?.companyName || quote.shipper?.name}
                    </span>
                    <span>${quote.totalPrice}</span>

                    {/* Open AcceptQuoteModal */}
                    <div
                      onClick={() => setSelectedQuote(quote)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      <LuCircleChevronRight
                        size={22}
                        className="text-system-primary hover:scale-110 transition"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ===================== QUESTIONS TAB ===================== */}
      {activeTab === "questions" && (
        <div className="bg-white border rounded-lg p-6 text-center text-gray-500">
          Questions feature coming soon 🚧
        </div>
      )}

      {/* ===================== ACCEPT QUOTE MODAL ===================== */}
      {selectedQuote && (
        <AcceptQuoteModal
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
        />
      )}
    </div>
  );
};

export default MyShipmentDetails;
