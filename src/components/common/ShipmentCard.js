import React from "react";
import { useNavigate } from "react-router-dom";
import { IoLocationOutline } from "react-icons/io5";
import { FiTruck } from "react-icons/fi";
import { HiArrowUpRight } from "react-icons/hi2";
import { createShipmentQueryToken } from "../../utils/createQueryToken";

const CustomerShipmentCard = ({ shipment }) => {
  const navigate = useNavigate();

  if (!shipment || !shipment.horses?.length) return null;

  const horse = shipment.horses[0];

  const truncateText = (text, maxLength = 18) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const formatDate = (date) => {
    if (!date) return "Pending";
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  };

  const handleNavigateWithQuery = () => {
    const token = createShipmentQueryToken(shipment._id);
    const params = new URLSearchParams({
      shipmentId: shipment._id,
      ref: token,
    });
    navigate(`/customer/my-shipments?${params.toString()}`);
  };

  const pickupDateText = `${formatDate(shipment?.pickupDateRange?.start)} - ${formatDate(
    shipment?.pickupDateRange?.end
  )}`;

  const deliveryDateText = `${formatDate(shipment?.deliveryDateRange?.start)} - ${formatDate(
    shipment?.deliveryDateRange?.end
  )}`;

  return (
    <div
      onClick={handleNavigateWithQuery}
      className="
    group relative w-full cursor-pointer
    bg-white p-3 shadow-[0_6px_18px_rgba(0,0,0,0.08)]
    transition-all duration-300
    hover:shadow-[0_10px_24px_rgba(0,0,0,0.12)]
    sm:p-4
    lg:p-5
    lg:hover:-translate-y-1
    lg:shadow-[0_8px_22px_rgba(0,0,0,0.10)]
    lg:hover:shadow-[0_14px_30px_rgba(0,0,0,0.14)]
  "
    >
      <button
        type="button"
        className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#BF9B53] text-white sm:right-4 sm:top-4"
      >
        <HiArrowUpRight size={16} />
      </button>

      <div className="flex flex-col gap-4 min-[1400px]:flex-row">
        <img
          src={horse?.photo?.url || "https://via.placeholder.com/150?text=Horse"}
          alt={horse?.registeredName || "Horse"}
          className="h-[200px] w-full shrink-0 rounded-[6px] object-cover object-center sm:h-[220px] lg:h-[190px] min-[1400px]:h-[210px] min-[1400px]:w-[240px]"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/150?text=Horse";
          }}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="pr-8 font-[Montserrat] text-[18px] font-bold leading-[28px] text-[#111827] md:leading-[32px] xl:text-[24px] lg:leading-[35px]">
            {shipment.numberOfHorses} Horse
            {shipment.numberOfHorses > 1 ? "s" : ""} Shipment
          </h3>

          <div className="grid grid-cols-1 gap-2 py-2 sm:grid-cols-2">
            <div className="flex items-center gap-1 text-[8px] text-[#4B5563]">
              <IoLocationOutline
                size={10}
                className="shrink-0 text-[#735D32] sm:h-[11px] sm:w-[11px] md:h-[13px] md:w-[9px]"
              />
              <span
                className="truncate font-[Montserrat]  font-semibold leading-[16px] text-[#4B5563] sm:text-[8px] sm:leading-[18px] text-[10px] md:leading-[20px]"
                title={shipment.pickupLocation}
              >
                {truncateText(shipment.pickupLocation, 18)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[8px] text-[#4B5563] sm:justify-end">
              <IoLocationOutline
                size={10}
                className="shrink-0 text-[#735D32] sm:h-[11px] sm:w-[11px] md:h-[13px] md:w-[9px]"
              />
              <span className="truncate font-[Montserrat] font-semibold leading-[16px] text-[#4B5563] sm:text-[8px] sm:leading-[18px] text-[10px] md:leading-[20px]" title={shipment.deliveryLocation}>
                {truncateText(shipment.deliveryLocation, 18)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-[minmax(88px,112px)_minmax(42px,1fr)_minmax(88px,112px)] items-center gap-2 sm:gap-3">
            <div>
              <div className="w-full rounded-[5px] border border-[#735D32] bg-white px-2 py-2 text-center md:py-[6px]">
                <p className="font-[Montserrat] text-[8px] font-semibold uppercase leading-[16px] text-center text-[#4B5563] sm:text-[9px] sm:leading-[18px] md:text-[10px] md:leading-[20px]">
                  Pickup
                </p>
                <p className="font-[Montserrat] text-[10px] font-bold uppercase leading-[18px] text-center text-[#735D32] sm:text-[11px] sm:leading-[19px] md:text-[12px] md:leading-[20px]">
                  {pickupDateText}
                </p>
              </div>
            </div>

            <div className="relative flex min-w-0 items-center justify-center">
              <span className="h-px w-full bg-[#BF9B53]" />
              <span className="absolute left-0 h-[6px] w-[6px] rounded-full bg-[#BF9B53]" />
              <div className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#FAF7EF] text-[#BF9B53]">
                <FiTruck size={17} />
              </div>
              <span className="absolute right-0 h-[6px] w-[6px] rounded-full bg-[#BF9B53]" />
            </div>

            <div>
              <div className="w-full rounded-[5px] border border-[#735D32] bg-white px-2 py-2 text-center md:py-[6px]">
                <p className="font-[Montserrat] text-[8px] font-semibold uppercase leading-[16px] text-center text-[#4B5563] sm:text-[9px] sm:leading-[18px] md:text-[10px] md:leading-[20px]">
                  Delivery
                </p>
                <p className="font-[Montserrat] text-[10px] font-bold uppercase leading-[18px] text-center text-[#735D32] sm:text-[11px] sm:leading-[19px] md:text-[12px] md:leading-[20px]">
                  {deliveryDateText}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-[#EFEFEF] pt-4 sm:mt-auto sm:flex-row sm:items-center sm:justify-between sm:pt-7">
            <p className="font-[Montserrat] text-[12px] font-medium leading-[16px] text-[#4B5563] sm:text-[9px] sm:leading-[18px] md:text-[10px] md:leading-[20px]">
              Horses:{" "}
              <span className="font-[Montserrat] text-[8px] font-medium leading-[16px] tracking-normal text-[#4B5563] sm:text-[9px] sm:leading-[18px] md:text-[10px] md:leading-[20px]">
                {shipment.numberOfHorses}
              </span>
            </p>

            <span className="w-fit border border-[#BF9B53] px-4 py-2 font-[Montserrat] text-[10px] font-semibold uppercase text-[#BF9B53]">
              {shipment.status || "OPEN FOR OFFERS"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerShipmentCard;
