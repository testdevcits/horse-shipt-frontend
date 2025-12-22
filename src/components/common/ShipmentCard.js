import React from "react";
import { useNavigate } from "react-router-dom";
import { IoLocationOutline } from "react-icons/io5";
import { LuCalendarDays } from "react-icons/lu";
import StatusBadge from "./StatusBadge"; // Import your reusable badge

const ShipmentCard = ({ shipment }) => {
  const navigate = useNavigate();

  // Navigate to shipment details page
  const handleClick = () => {
    navigate(`/customer/my-shipments?shipmentId=${shipment._id}`);
  };

  // Determine pickup badge colors based on pickup date
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
    const diffMs = pickup.getTime() - today.getTime();

    if (pickup.toDateString() === today.toDateString()) {
      return {
        bgColor: "bg-success-100",
        borderColor: "border-success-700",
        dotColor: "bg-success-400",
        textColor: "text-success-700",
      };
    } else if (diffMs < 24 * 60 * 60 * 1000 && diffMs > 0) {
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
      onClick={handleClick}
      className="flex flex-row w-full border border-gray-300 rounded-[14px] p-3 gap-4 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
    >
      {/* Left Image */}
      <div className="flex-shrink-0">
        <img
          src={shipment.horses[0]?.photo?.url}
          alt={shipment.horses[0]?.registeredName || shipment._id}
          className="w-[80px] h-[124px] sm:w-[100px] sm:h-[140px] md:w-[140px] md:h-[160px] lg:h-[180px] rounded-[10px] object-cover"
        />
      </div>

      {/* Right Content */}
      <div className="flex flex-col justify-between flex-1 gap-2 min-w-0">
        {/* Shipment Name / Horses Info */}
        <div className="flex items-center gap-2 text-gray-700 text-sm md:text-[14px] font-SemiBold">
          <h3 className="text-lg md:text-xl font-semibold mb-0">
            {shipment.numberOfHorses} Horse
            {shipment.numberOfHorses > 1 ? "s" : ""} Shipping from{" "}
            <span className="font-medium">{shipment.pickupLocation}</span> to{" "}
            <span className="font-medium">{shipment.deliveryLocation}</span>
          </h3>
        </div>

        {/* Pickup Status */}
        <div className="flex items-center gap-2 md:gap-4">
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
        <div className="flex items-center gap-2 text-gray-700 text-sm md:text-[14px] font-montserrat">
          <IoLocationOutline size={18} />
          <span>{shipment.pickupLocation}</span>
        </div>

        {/* Delivery Date */}
        <div className="flex items-center gap-2 text-gray-700 text-sm md:text-[14px] font-montserrat">
          <LuCalendarDays size={18} />
          <span>
            {shipment.deliveryDate &&
              new Date(shipment.deliveryDate).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ShipmentCard;
