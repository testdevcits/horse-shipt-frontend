import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SlLocationPin } from "react-icons/sl";
import { LuCalendarDays } from "react-icons/lu";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useShipperShipment } from "../../contexts/shipperContext/ShipperShipmentContext";
import { useVehicle } from "../../contexts/VehicleContext";
import Button from "../../components/common/Button";
import { ChatIcon } from "../../components/common/ColoredIcons";
import OfferSubmitModal from "./OfferSubmitModal"; // Import your modal

const ShipmentDetails = ({ shipmentId: defaultId }) => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();

  const { shipments, getAvailableShipments, loading } = useShipperShipment();
  const vehicleContext = useVehicle() || {};
  const vehicles = vehicleContext.vehicles || [];
  const vehiclesLoading = vehicleContext.loading || false;

  const [shipment, setShipment] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);

  const idToUse = paramId || defaultId;

  // Fetch shipments if not loaded
  useEffect(() => {
    if (!shipments.length) getAvailableShipments();
  }, [shipments, getAvailableShipments]);

  // Find shipment by ID
  useEffect(() => {
    if (!idToUse || !shipments.length) return;
    const foundShipment = shipments.find((s) => s._id === idToUse);
    setShipment(foundShipment || null);
  }, [idToUse, shipments]);

  if (loading) {
    return (
      <div className="p-6 font-montserrat text-sm text-gray-600">
        Loading shipment...
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="p-6 font-montserrat text-sm text-gray-600">
        Shipment not found
      </div>
    );
  }

  return (
    <div className="font-montserrat flex flex-col gap-6 relative text-sm leading-5 font-normal">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-2">
        <h1 className="font-montserrat font-semibold text-[30px] text-systemText leading-[38px]">
          Shipping Title – ID {shipment._id.slice(0, 8)}
        </h1>

        <div className="text-gray-600 md:text-right font-montserrat font-normal text-[16px] leading-[24px]">
          <p>Listed on {new Date(shipment.createdAt).toLocaleDateString()}</p>
          <p>
            by{" "}
            <span className="text-black font-montserrat font-normal text-[16px] leading-[24px]">
              {shipment.customer?.name || "Unknown User"}
            </span>
          </p>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white border border-gray-300 rounded-[10px] ">
        <div className="flex flex-col md:flex-row gap-4  p-4  md:gap-8  md:p-4">
          {/* Image */}
          <div className="order-1 md:order-2 w-full md:w-[60%]">
            <img
              src={shipment.horses[0]?.photo?.url}
              alt="shipment"
              className="w-full h-[220px] sm:h-[280px] md:h-[382px] object-cover rounded-sm"
            />
          </div>

          {/* Content */}
          <div className="order-2 md:order-1 w-full md:w-[40%] flex flex-col gap-8 font-montserrat font-medium text-paragraph">
            {/* Pickup Info */}
            <div className="flex flex-col gap-1">
              <h3 className="mb-1 text-gray-500 font-medium text-paragraph">
                Pickup Info
              </h3>
              <p className="flex gap-2 items-center text-gray-700 font-medium text-paragraph">
                <SlLocationPin /> {shipment.pickupLocation}
              </p>
              <p className="flex gap-2 items-center text-gray-700 font-medium text-paragraph">
                <LuCalendarDays />{" "}
                {new Date(shipment.pickupDate).toLocaleDateString()}
              </p>
            </div>

            {/* Delivery Info */}
            <div className="flex flex-col gap-1">
              <h3 className="mb-1 text-gray-500 font-medium text-paragraph">
                Delivery Info
              </h3>
              <p className="flex gap-2 items-center text-gray-700 font-medium text-paragraph">
                <SlLocationPin /> {shipment.deliveryLocation}
              </p>
              <p className="flex gap-2 items-center text-gray-700 font-medium text-paragraph">
                <LuCalendarDays />{" "}
                {new Date(shipment.deliveryDate).toLocaleDateString()}
              </p>
            </div>

            {/* Estimated Distance */}
            <div className="flex flex-col gap-1">
              <h3 className="mb-1 text-gray-500 font-medium text-[15px] leading-[18px]">
                ESTIMATED DISTANCE
              </h3>
              <p className="flex gap-2 items-center text-gray-700">
                <span className="font-montserrat font-semibold text-[30px] leading-[38px]">
                  200
                </span>{" "}
                miles
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                fullWidth
                onClick={() => setIsOfferOpen(true)}
              >
                Submit an Offer
              </Button>

              <Button
                variant="secondary"
                fullWidth
                icon={<ChatIcon color="gray-500" />}
                onClick={() => navigate(`/shipper/chat`)}
              >
                Send Buyer a Message
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* SHIPMENT DETAILS */}
      <div className="border border-gray-300 rounded-[10px] p-4">
        <div className="flex items-center justify-between h-[44px] p-[14px] bg-[#F2EBDD] rounded-[8px] cursor-pointer">
          <h2 className="text-[16px] font-medium text-[#333333]">
            Shipment Details
          </h2>
          {openDetails ? (
            <FiChevronUp
              size={20}
              onClick={() => setOpenDetails(false)}
              className="cursor-pointer"
            />
          ) : (
            <FiChevronDown
              size={20}
              onClick={() => setOpenDetails(true)}
              className="cursor-pointer"
            />
          )}
        </div>

        {openDetails && (
          <div className="p-4 space-y-6">
            <div className="flex gap-6">
              <div className="w-1/4 text-gray-800 font-normal">
                GENERAL DETAILS
              </div>
              <div className="w-3/4 flex flex-col gap-1 text-gray-700">
                <span>Total Horses: {shipment.horses.length}</span>
                <span>Total Weight: 2000 pounds</span>
              </div>
            </div>

            <div className="border-t border-gray-300 my-4" />

            {shipment.horses.map((horse, index) => (
              <div key={horse._id} className="flex gap-6">
                <div className="w-1/4 font-normal text-gray-800">
                  HORSE {index + 1}
                </div>
                <div className="w-3/4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 font-normal">
                  <div className="flex gap-2">
                    <p className="text-gray-500 text-sm">Registered Name:</p>
                    <p>{horse.registeredName}</p>
                  </div>
                  <div className="flex gap-2">
                    <p className="text-gray-500 text-sm">Barn Name:</p>
                    <p>{horse.barnName}</p>
                  </div>
                  <div className="flex gap-2">
                    <p className="text-gray-500 text-sm">Breed:</p>
                    <p>{horse.breed}</p>
                  </div>
                  <div className="flex gap-2">
                    <p className="text-gray-500 text-sm">Colour:</p>
                    <p>{horse.colour}</p>
                  </div>
                  <div className="flex gap-2">
                    <p className="text-gray-500 text-sm">Age:</p>
                    <p>{horse.age}</p>
                  </div>
                  <div className="flex gap-2">
                    <p className="text-gray-500 text-sm">Sex:</p>
                    <p>{horse.sex}</p>
                  </div>
                  <div className="sm:col-span-2 gap-2">
                    <p className="text-gray-500 text-sm">General Info:</p>
                    <p>{horse.generalInfo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Offer Modal */}
      {isOfferOpen && (
        <OfferSubmitModal
          shipment={shipment}
          onClose={() => setIsOfferOpen(false)}
          vehicles={vehicles} // pass vehicles
          vehiclesLoading={vehiclesLoading} // pass loading state
        />
      )}
    </div>
  );
};

export default ShipmentDetails;
