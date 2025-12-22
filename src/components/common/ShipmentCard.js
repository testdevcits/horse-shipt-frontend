import React from "react";
import { useNavigate } from "react-router-dom";
import { IoLocationOutline } from "react-icons/io5";
import { LuCalendarDays } from "react-icons/lu";

const ShipmentCard = ({ shipment }) => {
  const navigate = useNavigate();

  // Navigate to shipment details page
  const handleClick = () => {
    navigate(`/customer/my-shipments?shipmentId=${shipment._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="flex flex-row w-full border border-gray-300 rounded-[14px] gap-4 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
    >
      {/* Left Image */}
      <div className="flex-shrink-0">
        <img
          src={shipment.horses[0]?.photo?.url}
          alt={shipment.horses[0]?.registeredName || shipment._id}
          className="w-[80px] h-[124px] sm:w-[100px] sm:h-[140px] md:w-[140px] md:h-[160px] lg:h-[180px] rounded-[16px] object-cover"
        />
      </div>

      {/* Right Content */}
      <div className="flex flex-col justify-between flex-1 gap-2 min-w-0">
        {/* Shipment Name */}
        <div className="flex items-center gap-2 text-gray-700 text-sm md:text-[14px] font-montserrat">
          <IoLocationOutline size={18} />
          <h3 className="text-md text-gray-800 mb-0">
            {shipment.numberOfHorses} Horse
            {shipment.numberOfHorses > 1 ? "s" : ""} Shipping from{" "}
            <span className="font-medium">{shipment.pickupLocation}</span> to{" "}
            <span className="font-medium">{shipment.deliveryLocation}</span>
          </h3>
        </div>

        {/* Delivery Status */}
        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-sm font-montserrat">Delivery</span>
          <p
            className={`w-[90px] h-[24px] text-sm flex items-center justify-center rounded-full border font-medium ${
              shipment.deliveryDate &&
              new Date(shipment.deliveryDate).toDateString() ===
                new Date().toDateString()
                ? "text-success-700 border-success-700 bg-success-100"
                : shipment.deliveryDate &&
                  new Date(shipment.deliveryDate).getTime() -
                    new Date().getTime() <
                    24 * 60 * 60 * 1000
                ? "text-yellow-700 border-yellow-700 bg-yellow-100"
                : "text-gray-500 border-gray-300"
            }`}
          >
            {shipment.deliveryDate
              ? new Date(shipment.deliveryDate).toLocaleDateString()
              : "Pending"}
          </p>
        </div>

        {/* Address */}
        <div className="flex items-center gap-2 text-gray-700 text-sm md:text-[14px] font-montserrat">
          <IoLocationOutline size={18} />
          <span>{shipment.pickupLocation}</span>
        </div>

        {/* Date */}
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
