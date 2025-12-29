import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { SlLocationPin } from "react-icons/sl";
import { LuCalendarDays } from "react-icons/lu";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

import { useCustomerShipments } from "../../contexts/customerContext/CustomerShipmentContext";
import { useCustomerQuote } from "../../contexts/customerContext/CustomerQuoteContext";
import Button from "../../components/common/Button";
import PageLoader from "../../components/common/PageLoader";

const MyShipmentDetails = () => {
  const { id: paramId } = useParams(); // From URL /my-shipment/:id
  const [searchParams] = useSearchParams(); // From query ?shipmentId=
  const queryId = searchParams.get("shipmentId");

  const shipmentId = paramId || queryId; // Use param first, then query

  const { fetchShipmentById, currentShipment, loading } =
    useCustomerShipments();

  const { quotes, getQuotesByShipment } = useCustomerQuote();

  const [activeTab, setActiveTab] = useState("overview");
  const [openDetails, setOpenDetails] = useState(false);

  // Fetch shipment and quotes
  useEffect(() => {
    if (shipmentId) {
      fetchShipmentById(shipmentId);
      getQuotesByShipment(shipmentId);
    }
  }, [shipmentId, fetchShipmentById, getQuotesByShipment]);

  if (loading)
    return <PageLoader text="Loading shipment details..." fullScreen />;

  if (!currentShipment)
    return <p className="text-red-500 text-center mt-8">Shipment not found.</p>;

  const shipment = currentShipment;

  /* ===================== TAB BUTTON ===================== */
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
    <div className="w-full font-montserrat">
      <h2 className="font-semibold text-2xl md:text-3xl mb-6">
        Shipment Details
      </h2>

      {/* ===================== TABS ===================== */}
      <div className="flex gap-6 border-b mb-6">
        <TabButton id="overview" label="Overview" />
        <TabButton id="quotes" label="Quotes" count={quotes.length} />
        <TabButton id="questions" label="Questions" />
      </div>

      {/* ===================== OVERVIEW TAB ===================== */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          {/* MAIN CARD */}
          <div className="bg-white border rounded-lg p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image */}
              <div className="w-full md:w-[60%]">
                <img
                  src={shipment.horses[0]?.photo?.url}
                  alt="shipment"
                  className="w-full h-[220px] md:h-[360px] object-cover rounded-md"
                />
              </div>

              {/* Content */}
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
        <div className="bg-white border rounded-lg p-6">
          {quotes.length === 0 ? (
            <p className="text-gray-500 text-center">No quotes received yet.</p>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <div
                  key={quote._id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">
                      {quote.shipper?.companyName || quote.shipper?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${quote.totalPrice} • {quote.status}
                    </p>
                  </div>

                  <Button variant="secondary" disabled>
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== QUESTIONS TAB ===================== */}
      {activeTab === "questions" && (
        <div className="bg-white border rounded-lg p-6 text-center text-gray-500">
          Questions feature coming soon 🚧
        </div>
      )}
    </div>
  );
};

export default MyShipmentDetails;
