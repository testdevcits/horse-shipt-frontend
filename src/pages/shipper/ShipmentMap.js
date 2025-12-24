import React from "react";
import { useNavigate } from "react-router-dom";
import { GoArrowSwitch } from "react-icons/go";
import { LuCircleChevronRight } from "react-icons/lu";
import placeholderImage from "../../assets/images/shipperMap.png";

const ShipmentMap = ({ shipments }) => {
  const navigate = useNavigate();

  const handleNavigate = (id) => {
    navigate(`/shipper/shipments/${id}`);
  };

  if (!shipments.length) {
    return (
      <p className="text-center text-gray-500 text-base leading-6 font-montserrat">
        No shipments to show
      </p>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* LEFT SIDE – Shipment List */}
      <div className="flex-1 flex flex-col overflow-y-auto max-h-[456px] bg-white rounded-lg">
        {shipments.map((shipment, index) => (
          <div key={shipment._id} className="flex flex-col px-2 sm:px-4">
            {/* ROW */}
            <div className="flex items-center justify-between py-3 gap-3">
              {/* LEFT */}
              <div className="flex flex-col min-w-0">
                <h2 className="text-gray-800 text-sm sm:text-base leading-6 font-montserrat truncate">
                  Pickup: {shipment.pickupLocation}
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm leading-5 font-montserrat">
                  Estimated Distance: {shipment.estimatedDistance || 80} Km
                </p>
              </div>

              {/* CENTER */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-9 h-9 rounded-full border border-system-primary flex items-center justify-center">
                  <GoArrowSwitch size={18} className="text-system-primary" />
                </div>
                <span className="hidden sm:inline font-montserrat font-normal text-[12px] leading-[18px] text-[#735D32] whitespace-nowrap">
                  {shipment.directions || "Directions"}
                </span>
              </div>

              {/* RIGHT */}
              <div
                className="flex flex-col items-center gap-1 cursor-pointer shrink-0"
                onClick={() => handleNavigate(shipment._id)}
              >
                <div className="w-9 h-9 rounded-full border border-system-primary flex items-center justify-center hover:bg-system-primary/10 transition">
                  <LuCircleChevronRight
                    size={18}
                    className="text-system-primary"
                  />
                </div>
                <span className="hidden sm:inline font-montserrat font-normal text-[12px] leading-[18px] text-[#735D32] whitespace-nowrap">
                  Details
                </span>
              </div>
            </div>

            {/* DIVIDER */}
            {index !== shipments.length - 1 && (
              <div className="h-px w-full bg-gray-300" />
            )}
          </div>
        ))}
      </div>

      {/* RIGHT SIDE – MAP */}
      <div className="w-full lg:w-[902px] h-[260px] sm:h-[360px] lg:h-[456px] flex-shrink-0">
        <img
          src={placeholderImage}
          alt="Map Preview"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    </div>
  );
};

export default ShipmentMap;
