import React from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../components/common/StatusBadge";
import { SlLocationPin } from "react-icons/sl";
import { LuCalendarDays, LuCircleChevronRight } from "react-icons/lu";
import { createShipmentQueryToken } from "../../utils/createQueryToken";

const ShipmentCard = ({ shipment }) => {
  const navigate = useNavigate();

  if (!shipment || !shipment.horses?.length) return null;
  const horse = shipment.horses[0];

  const handleNavigateWithQuery = () => {
    const token = createShipmentQueryToken(shipment._id);
    const params = new URLSearchParams({
      shipmentId: shipment._id,
      ref: token,
    });
    navigate(`/shipper/shipments/details?${params.toString()}`);
  };

  const isPickupToday =
    new Date(shipment.pickupDate).toDateString() === new Date().toDateString();

  return (
    <div className="relative bg-white border border-gray-200 rounded-lg p-4 md:p-6 font-montserrat shadow-sm hover:shadow-md w-full overflow-hidden break-words">
      {/* TOP-RIGHT ARROW (fixed for all screens) */}
      <div
        onClick={handleNavigateWithQuery}
        className="absolute top-4 right-4 cursor-pointer rounded-full p-1 z-10 
             hover:scale-110 transition-transform duration-200"
      >
        <LuCircleChevronRight size={24} className="text-system-primary" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full">
        {/* LEFT SECTION */}
        <div className="flex-1 min-w-0">
          <h3 className="mb-3 text-gray-800 font-normal text-[16px] md:text-[17px] leading-[24px] break-words">
            {shipment.numberOfHorses} Horse Shipping from{" "}
            <span className="font-medium break-words">
              {shipment.pickupLocation}
            </span>{" "}
            to{" "}
            <span className="font-medium break-words">
              {shipment.deliveryLocation}
            </span>
          </h3>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* HORSE IMAGE */}
            <img
              src={horse?.photo?.url}
              alt={horse?.registeredName}
              className="w-full h-[180px] rounded-md object-cover sm:w-[120px] sm:h-[120px] md:w-[150px] md:h-[150px] flex-shrink-0"
            />

            {/* PICKUP & DELIVERY */}
            <div className="flex flex-col sm:flex-row gap-6 w-full text-[15px] md:text-[16px] flex-wrap">
              {/* PICKUP */}
              <div className="flex flex-col gap-2 w-full min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-800 font-medium">Pickup</span>
                  <StatusBadge
                    text={isPickupToday ? "Today" : "Scheduled"}
                    bgColor={isPickupToday ? "bg-green-100" : "bg-[#FEF9C3]"}
                    borderColor={
                      isPickupToday ? "border-green-600" : "border-[#A16207]"
                    }
                    textColor={
                      isPickupToday ? "text-green-700" : "text-[#A16207]"
                    }
                    paddingX="px-2"
                    paddingY="py-0.5"
                    showDot={false}
                  />
                </div>

                <p
                  className="flex items-center gap-2 text-gray-600 break-words"
                  title={shipment.pickupLocation}
                >
                  <SlLocationPin size={18} />
                  <span>{shipment.pickupLocation}</span>
                </p>

                <p className="flex items-center gap-2 text-gray-600">
                  <LuCalendarDays size={18} />
                  {new Date(shipment.pickupDate).toLocaleDateString()}
                </p>
              </div>

              {/* DELIVERY */}
              <div className="flex flex-col gap-2 w-full min-w-0">
                <span className="text-gray-800 font-medium">Delivery</span>

                <p
                  className="flex items-center gap-2 text-gray-600 break-words"
                  title={shipment.deliveryLocation}
                >
                  <SlLocationPin size={18} />
                  <span>{shipment.deliveryLocation}</span>
                </p>

                <p className="flex items-center gap-2 text-gray-600">
                  <LuCalendarDays size={18} />
                  {new Date(shipment.deliveryDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="hidden md:block w-px bg-gray-200" />

        {/* RIGHT SECTION */}
        <div className="flex flex-col text-[16px] mt-4 md:mt-0 md:min-w-[220px]">
          <h4 className="mb-3 text-gray-800 font-medium">General Details</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
            <div className="flex gap-1 flex-wrap">
              <span className="text-gray-500">Estimated Distance:</span>
              <span className="font-medium">
                {shipment.estimatedDistance
                  ? `${shipment.estimatedDistance.miles} miles (${shipment.estimatedDistance.km} km)`
                  : "200 miles"}
              </span>
            </div>

            <div className="flex gap-1 flex-wrap">
              <span className="text-gray-500">Transport Type:</span>
              <span className="font-medium">
                {shipment.transportType || "Trucking"}
              </span>
            </div>

            <div className="flex gap-1 flex-wrap">
              <span className="text-gray-500">Total Horses:</span>
              <span className="font-medium">{shipment.numberOfHorses}</span>
            </div>

            <div className="flex gap-1 flex-wrap">
              <span className="text-gray-500">Buyer:</span>
              <span className="font-medium">
                {shipment.customer?.name || "Buyer Name"}
              </span>
            </div>

            <div className="flex gap-1 flex-wrap">
              <span className="text-gray-500">Stalls:</span>
              <span className="font-medium">
                {shipment.stallsRequired || 1}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentCard;
