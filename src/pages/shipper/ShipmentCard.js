import React from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../components/common/StatusBadge";
import { SlLocationPin } from "react-icons/sl";
import { LuCalendarDays, LuCircleChevronRight } from "react-icons/lu";

const ShipmentCard = ({ shipment }) => {
  const navigate = useNavigate();

  if (!shipment || !shipment.horses?.length) return null;

  const horse = shipment.horses[0];

  const handleNavigate = () => {
    navigate(`/shipper/chat`);
  };

  return (
    <div className="bg-white border-2 border-gray-300 rounded p-4 font-[Montserrat]">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6">
        {/* LEFT COLUMN – HORSE DETAILS */}
        <div>
          <h3 className="text-md text-gray-800 mb-3">
            {shipment.numberOfHorses} Horse Shipping from{" "}
            <span className="font-medium">{shipment.pickupLocation}</span> to{" "}
            <span className="font-medium">{shipment.deliveryLocation}</span>
          </h3>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <img
              src={horse?.photo?.url}
              alt={horse?.registeredName}
              className="w-[100px] h-[100px] object-cover rounded-md"
            />

            <div className="flex flex-col md:flex-row gap-6 mt-2 md:mt-0">
              {/* Pickup */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-800">
                    Pickup
                  </span>
                  <StatusBadge
                    text="Today"
                    bgColor="bg-[#FEF9C3]"
                    borderColor="border-[#A16207]"
                    dotColor="bg-[#A16207]"
                    textColor="text-[#A16207]"
                    paddingX="px-2"
                    paddingY="py-0.5"
                  />
                </div>
                <p className="flex items-center text-sm text-gray-700 gap-2">
                  <SlLocationPin size={18} /> {shipment.pickupLocation}
                </p>
                <p className="flex items-center text-sm text-gray-700 gap-2">
                  <LuCalendarDays size={18} />{" "}
                  {new Date(shipment.pickupDate).toLocaleDateString()}
                </p>
              </div>

              {/* Delivery */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-800">
                  Delivery
                </span>
                <p className="flex items-center text-sm text-gray-700 gap-2">
                  <SlLocationPin size={18} /> {shipment.deliveryLocation}
                </p>
                <p className="flex items-center text-sm text-gray-700 gap-2">
                  <LuCalendarDays size={18} />{" "}
                  {new Date(shipment.deliveryDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="hidden md:block w-[1px] bg-gray-200" />

        {/* RIGHT COLUMN */}
        <div className="flex flex-col relative">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            General Details
          </h3>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-800">
                Pickup
              </span>
              <p className="flex items-center text-sm text-gray-700 gap-2">
                <SlLocationPin size={18} /> {shipment.pickupLocation}
              </p>
              <p className="flex items-center text-sm text-gray-700 gap-2">
                <LuCalendarDays size={18} />{" "}
                {new Date(shipment.pickupDate).toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-800">
                Delivery
              </span>
              <p className="flex items-center text-sm text-gray-700 gap-2">
                <SlLocationPin size={18} /> {shipment.deliveryLocation}
              </p>
              <p className="flex items-center text-sm text-gray-700 gap-2">
                <LuCalendarDays size={18} />{" "}
                {new Date(shipment.deliveryDate).toLocaleDateString()}
              </p>
            </div>

            {/* CLICKABLE ARROW */}
            <div
              onClick={handleNavigate}
              className="mt-4 md:mt-0 md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 cursor-pointer"
            >
              <LuCircleChevronRight
                size={24}
                className="text-system-primary hover:scale-110 transition"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentCard;
