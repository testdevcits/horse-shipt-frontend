// src/components/common/CustomerShipmentCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../components/common/StatusBadge";
import { SlLocationPin } from "react-icons/sl";
import { LuCalendarDays, LuCircleChevronRight } from "react-icons/lu";

const CustomerShipmentCard = ({ shipment }) => {
  const navigate = useNavigate();

  if (!shipment || !shipment.horses?.length) return null;
  const horse = shipment.horses[0];

  // Navigate to shipment details page
  const handleNavigate = () => {
    navigate(`/customer/my-shipments?shipmentId=${shipment._id}`);
  };

  return (
    <div className="relative bg-white border border-gray-200 rounded-md p-4 font-montserrat cursor-pointer hover:shadow-md transition-shadow duration-200">
      {/* MOBILE TOP RIGHT ARROW */}
      <div
        onClick={handleNavigate}
        className="absolute top-4 right-4 md:hidden cursor-pointer"
      >
        <LuCircleChevronRight size={22} className="text-system-primary" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6">
        {/* LEFT SECTION */}
        <div>
          <h3 className="mb-3 text-gray-800 font-normal text-[16px] leading-[24px]">
            {shipment.numberOfHorses} Horse
            {shipment.numberOfHorses > 1 ? "s" : ""} Shipping from{" "}
            <span className="font-medium">{shipment.pickupLocation}</span> to{" "}
            <span className="font-medium">{shipment.deliveryLocation}</span>
          </h3>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Horse Image */}
            <img
              src={horse?.photo?.url}
              alt={horse?.registeredName}
              className="w-full h-[180px] rounded-md object-cover sm:w-[100px] sm:h-[100px]"
            />

            {/* Pickup & Delivery */}
            <div className="flex flex-col sm:flex-row gap-6 w-full text-[16px]">
              {/* Pickup */}
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2">
                  <span className="text-gray-800 font-medium">Pickup</span>
                  <StatusBadge
                    text={
                      shipment.pickupDate
                        ? new Date(shipment.pickupDate).toLocaleDateString()
                        : "Pending"
                    }
                    bgColor="bg-[#FEF9C3]"
                    borderColor="border-[#A16207]"
                    textColor="text-[#A16207]"
                    paddingX="px-2"
                    paddingY="py-0.5"
                    showDot={false}
                  />
                </div>

                <p
                  className="flex items-center gap-2 text-gray-600 truncate"
                  title={shipment.pickupLocation}
                >
                  <SlLocationPin size={18} />
                  <span className="truncate">{shipment.pickupLocation}</span>
                </p>

                <p className="flex items-center gap-2 text-gray-600">
                  <LuCalendarDays size={18} />
                  {shipment.pickupDate &&
                    new Date(shipment.pickupDate).toLocaleDateString()}
                </p>
              </div>

              {/* Delivery */}
              <div className="flex flex-col gap-2 w-full">
                <span className="text-gray-800 font-medium">Delivery</span>

                <p
                  className="flex items-center gap-2 text-gray-600 truncate"
                  title={shipment.deliveryLocation}
                >
                  <SlLocationPin size={18} />
                  <span className="truncate">{shipment.deliveryLocation}</span>
                </p>

                <p className="flex items-center gap-2 text-gray-600">
                  <LuCalendarDays size={18} />
                  {shipment.deliveryDate &&
                    new Date(shipment.deliveryDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="hidden md:block w-px bg-gray-200" />

        {/* RIGHT SECTION */}
        <div className="relative flex flex-col text-[16px]">
          <h4 className="mb-3 text-gray-800 font-medium">General Details</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
            <div className="flex gap-1">
              <span className="text-gray-500">Total Horses:</span>
              <span className="font-medium">{shipment.numberOfHorses}</span>
            </div>

            <div className="flex gap-1">
              <span className="text-gray-500">Buyer:</span>
              <span className="font-medium">
                {shipment.customer?.name || "Buyer Name"}
              </span>
            </div>

            <div className="flex gap-1">
              <span className="text-gray-500">Transport Type:</span>
              <span className="font-medium">
                {shipment.transportType || "Trucking"}
              </span>
            </div>

            <div className="flex gap-1">
              <span className="text-gray-500">Stalls:</span>
              <span className="font-medium">
                {shipment.stallsRequired || 1}
              </span>
            </div>

            <div className="flex gap-1">
              <span className="text-gray-500">Total Price:</span>
              <span className="font-medium text-system-primary">
                ${shipment.totalPrice || ""} USD
              </span>
            </div>
          </div>

          {/* DESKTOP ARROW */}
          <div
            onClick={handleNavigate}
            className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            <LuCircleChevronRight
              size={22}
              className="text-system-primary hover:scale-110 transition"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerShipmentCard;
