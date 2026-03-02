import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { validateShipmentQueryToken } from "../../utils/createQueryToken";
import { SlLocationPin } from "react-icons/sl";
import { LuCalendarDays } from "react-icons/lu";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useShipperShipment } from "../../contexts/shipperContext/ShipperShipmentContext";
import { useVehicle } from "../../contexts/VehicleContext";
import Button from "../../components/common/Button";
import { ChatIcon } from "../../components/common/ColoredIcons";
import OfferSubmitModal from "./OfferSubmitModal";
import { getPublishedTime } from "../../utils/timeAgo";
import AskQuestionModal from "./AskQuestionModal";
import { FiHelpCircle } from "react-icons/fi";

const ShipmentDetails = ({ shipmentId: defaultId }) => {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const shipmentIdFromQuery = searchParams.get("shipmentId");
  const tokenFromQuery = searchParams.get("ref");

  const { shipments, getAvailableShipments, loading } = useShipperShipment();
  const [isQuestionOpen, setIsQuestionOpen] = useState(false);

  const vehicleContext = useVehicle() || {};
  const vehicles = vehicleContext.vehicles || [];
  const vehiclesLoading = vehicleContext.loading || false;

  const [shipment, setShipment] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);

  const idToUse = shipmentIdFromQuery || paramId || defaultId;

  useEffect(() => {
    if (!validateShipmentQueryToken(tokenFromQuery, idToUse)) {
      navigate("/shipper/dashboard", { replace: true });
      return;
    }

    const decoded = JSON.parse(atob(tokenFromQuery));
    const timeLeft = decoded.exp - Date.now();

    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        navigate("/shipper/dashboard", { replace: true });
      }, timeLeft);

      return () => clearTimeout(timer);
    } else {
      // Already expired
      navigate("/shipper/dashboard", { replace: true });
    }
  }, [tokenFromQuery, idToUse, navigate]);

  useEffect(() => {
    if (!shipments.length) getAvailableShipments();
  }, [shipments, getAvailableShipments]);

  useEffect(() => {
    if (!idToUse || !shipments.length) return;
    const foundShipment = shipments.find(
      (s) => String(s._id) === String(idToUse)
    );
    setShipment(foundShipment || null);
  }, [idToUse, shipments]);

  if (loading)
    return <div className="p-6 text-gray-600">Loading shipment...</div>;
  if (!shipment)
    return <div className="p-6 text-gray-600">Shipment not found</div>;

  return (
    <div className="font-montserrat flex flex-col gap-6 relative text-sm leading-5 font-normal">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <h1 className="font-montserrat font-semibold text-[30px] text-systemText leading-[38px] uppercase">
          Shipping_ID :{" "}
          <span className="text-[#BF9B53]">{shipment.shipmentCode}</span>
        </h1>

        <div className="flex flex-col items-end gap-2">
          <div className="text-gray-600 md:text-right font-montserrat font-normal text-[16px] leading-[24px]">
            <p>Listed - {getPublishedTime(shipment.publishedAt)}</p>
            <p>
              by{" "}
              <span className="text-black">
                {shipment.customer?.name || "Unknown User"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white border border-gray-300 rounded-[10px]">
        <div className="flex flex-col md:flex-row gap-4 p-4 md:gap-8 md:p-4">
          <div className="order-1 md:order-2 w-full md:w-[60%]">
            <img
              src={shipment.horses[0]?.photo?.url}
              alt="shipment"
              className="w-full h-[220px] sm:h-[280px] md:h-[382px] object-cover rounded-sm"
            />
          </div>

          <div className="order-2 md:order-1 w-full md:w-[40%] flex flex-col gap-8">
            <div className="flex flex-col gap-1">
              <h3 className="mb-1 text-gray-500 font-medium">Pickup Info</h3>
              <p className="flex gap-2 items-center text-gray-700 font-medium">
                <SlLocationPin /> {shipment.pickupLocation}
              </p>
              <p className="flex gap-2 items-center text-gray-700 font-medium">
                <LuCalendarDays />{" "}
                {new Date(shipment.pickupDate).toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="mb-1 text-gray-500 font-medium">Delivery Info</h3>
              <p className="flex gap-2 items-center text-gray-700 font-medium">
                <SlLocationPin /> {shipment.deliveryLocation}
              </p>
              <p className="flex gap-2 items-center text-gray-700 font-medium">
                <LuCalendarDays />{" "}
                {new Date(shipment.deliveryDate).toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="mb-1 text-gray-500 font-medium text-[15px] leading-[18px]">
                ESTIMATED DISTANCE
              </h3>
              <p className="flex gap-2 items-center text-gray-700">
                <span className="font-montserrat font-semibold text-[30px] leading-[38px]">
                  {shipment.estimatedDistance
                    ? shipment.estimatedDistance.miles
                    : 200}
                </span>{" "}
                miles
                {shipment.estimatedDistance && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({shipment.estimatedDistance.km} km)
                  </span>
                )}
              </p>
            </div>

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
                onClick={() =>
                  navigate(`/shipper/chat?customerId=${shipment.customer?._id}`)
                }
              >
                Chat with {shipment.customer?.name}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Button
        variant="secondary"
        size="sm"
        icon={<FiHelpCircle className="text-gray-500" size={18} />}
        onClick={() => setIsQuestionOpen(true)}
        className="whitespace-nowrap"
      >
        Ask Question
      </Button>

      {/* DETAILS TOGGLE */}
      <div className="border border-gray-300 rounded-[10px] p-4">
        <div
          className="flex items-center justify-between h-[44px] p-[14px] bg-[#F2EBDD] rounded-[8px] cursor-pointer"
          onClick={() => setOpenDetails(!openDetails)}
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

        {openDetails && (
          <div className="p-4 space-y-6">
            <div className="flex gap-6">
              <div className="w-1/4 text-gray-800 font-normal">
                GENERAL DETAILS
              </div>
              <div className="w-3/4 flex flex-col gap-1 text-gray-700">
                <span>Total Horses: {shipment.horses.length}</span>
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
          vehicles={vehicles}
          vehiclesLoading={vehiclesLoading}
        />
      )}
    </div>
  );
};

export default ShipmentDetails;
