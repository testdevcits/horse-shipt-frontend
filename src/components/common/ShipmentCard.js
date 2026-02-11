import React from "react";
import { useNavigate } from "react-router-dom";
import { IoLocationOutline } from "react-icons/io5";
import { LuCalendarDays } from "react-icons/lu";
import StatusBadge from "./StatusBadge"; // Reusable badge
import { createShipmentQueryToken } from "../../utils/createQueryToken";

const CustomerShipmentCard = ({ shipment }) => {
  const navigate = useNavigate();

  // Navigate with shipmentId + token query
  const handleNavigateWithQuery = () => {
    const token = createShipmentQueryToken(shipment._id);
    const params = new URLSearchParams({
      shipmentId: shipment._id,
      ref: token, // optional token for reference/security
    });
    navigate(`/customer/my-shipments?${params.toString()}`);
  };

  const getPickupStatusColors = () => {
    if (!shipment.pickupDate)
      return {
        bgColor: "bg-gray-200",
        borderColor: "border-gray-400",
        dotColor: "bg-gray-400",
        textColor: "text-gray-500",
      };

    const today = new Date();
    const pickup = new Date(shipment.pickupDate);

    if (pickup.toDateString() === today.toDateString()) {
      return {
        bgColor: "bg-success-100",
        borderColor: "border-success-700",
        dotColor: "bg-success-400",
        textColor: "text-success-700",
      };
    } else if (pickup > today && pickup - today < 24 * 60 * 60 * 1000) {
      return {
        bgColor: "bg-yellow-100",
        borderColor: "border-yellow-700",
        dotColor: "bg-yellow-400",
        textColor: "text-yellow-700",
      };
    } else {
      return {
        bgColor: "bg-gray-200",
        borderColor: "border-gray-400",
        dotColor: "bg-gray-400",
        textColor: "text-gray-500",
      };
    }
  };

  const { bgColor, borderColor, dotColor, textColor } = getPickupStatusColors();

  return (
    <div
      onClick={handleNavigateWithQuery}
      className="flex flex-col sm:flex-row w-full border border-gray-300 rounded-[14px] p-3 gap-3 sm:gap-4 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
    >
      {/* Left Image */}
      <div className="w-full sm:w-auto flex-shrink-0">
        <img
          src={shipment.horses[0]?.photo?.url}
          alt={shipment.horses[0]?.registeredName || shipment._id}
          className="w-full h-[200px] sm:w-[100px] sm:h-[140px] md:w-[120px] md:h-[160px] lg:h-[180px] rounded-[10px] object-cover"
        />
      </div>

      {/* Right Content */}
      <div className="flex flex-col justify-between flex-1 gap-2 min-w-0">
        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 truncate">
          {shipment.numberOfHorses} Horse
          {shipment.numberOfHorses > 1 ? "s" : ""} Shipping from{" "}
          <span className="font-medium">{shipment.pickupLocation}</span> to{" "}
          <span className="font-medium">{shipment.deliveryLocation}</span>
        </h3>

        {/* Pickup Status */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className="text-sm font-montserrat">Pickup</span>
          <StatusBadge
            text={
              shipment.pickupDate
                ? new Date(shipment.pickupDate).toLocaleDateString()
                : "Pending"
            }
            bgColor={bgColor}
            borderColor={borderColor}
            dotColor={dotColor}
            textColor={textColor}
          />
        </div>

        {/* Pickup Location */}
        <div className="flex items-center gap-2 text-gray-700 text-sm sm:text-[14px] font-montserrat truncate">
          <IoLocationOutline size={16} />
          <span className="truncate">{shipment.pickupLocation}</span>
        </div>

        {/* Delivery Date */}
        <div className="flex items-center gap-2 text-gray-700 text-sm sm:text-[14px] font-montserrat">
          <LuCalendarDays size={16} />
          <span>
            {shipment?.deliveryDate
              ? new Date(shipment.deliveryDate).toLocaleDateString()
              : "Pending"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomerShipmentCard;
