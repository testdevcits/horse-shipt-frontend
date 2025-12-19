import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SlLocationPin } from "react-icons/sl";
import { LuCalendarDays } from "react-icons/lu";
import { FiChevronDown, FiChevronUp, FiX } from "react-icons/fi";

import { shipments } from "../../data/shipments";
import Button from "../../components/common/Button";
import { ChatIcon } from "../../components/common/ColoredIcons";
import InputField from "../../components/common/InputField";
import Select from "../../components/common/Select";

const ShipmentDetails = ({ shipmentId: defaultId }) => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);

  useEffect(() => {
    const idToUse = paramId || defaultId;
    const foundShipment = shipments.find((s) => s._id === idToUse);
    setShipment(foundShipment || null);
  }, [paramId, defaultId]);

  if (!shipment) {
    return <div className="p-6">Shipment not found</div>;
  }

  return (
    <div className="font-[Montserrat] flex flex-col gap-6 relative">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between gap-2">
        <h1 className="text-[22px] md:text-[30px] font-semibold">
          Shipping Title – ID {shipment._id.slice(0, 8)}
        </h1>

        <div className="text-sm md:text-base text-gray-600 md:text-right">
          <p>Listed on {new Date(shipment.createdAt).toLocaleDateString()}</p>
          <p>
            by{" "}
            <span className="text-black">
              {localStorage.getItem("userName") || "Unknown User"}
            </span>
          </p>
        </div>
      </div>

      {/* ================= MAIN CARD ================= */}
      <div className="bg-white border border-gray-300 rounded-[14px] min-h-[414px]">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6">
          {/* Image */}
          <div className="order-1 md:order-2 w-full md:w-[60%]">
            <img
              src={shipment.horses[0]?.photo?.url}
              alt="shipment"
              className="w-full h-[220px] sm:h-[280px] md:h-[382px] object-cover rounded-lg"
            />
          </div>

          {/* Content */}
          <div className="order-2 md:order-1 w-full md:w-[40%] flex flex-col gap-5">
            <div>
              <h3 className="text-gray-500 mb-1">Pickup Info</h3>
              <p className="flex gap-2">
                <SlLocationPin /> {shipment.pickupLocation}
              </p>
              <p className="flex gap-2">
                <LuCalendarDays />
                {new Date(shipment.pickupDate).toLocaleDateString()}
              </p>
            </div>

            <div>
              <h3 className="text-gray-500 mb-1">Delivery Info</h3>
              <p className="flex gap-2">
                <SlLocationPin /> {shipment.deliveryLocation}
              </p>
              <p className="flex gap-2">
                <LuCalendarDays />
                {new Date(shipment.deliveryDate).toLocaleDateString()}
              </p>
            </div>

            <div>
              <h3 className="text-gray-500 mb-1">Estimated Distance</h3>
              <div className="flex gap-2 items-baseline">
                <span className="text-2xl">200</span>
                <span>miles</span>
              </div>
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
                onClick={() => navigate(`/chat/${shipment._id}`)}
              >
                Send Buyer a Message
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SHIPMENT DETAILS ================= */}
      <div className="border border-gray-300 rounded-[14px] p-4">
        <div
          onClick={() => setOpenDetails(!openDetails)}
          className="flex items-center justify-between h-[44px] p-[14px] bg-[#F2EBDD] rounded-[15px] cursor-pointer"
        >
          <h2 className="text-[16px] font-medium text-[#333333]">
            Shipment Details
          </h2>
          {openDetails ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {openDetails && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500">Shipment Type</p>
              <p className="font-medium">Horse Transport</p>
            </div>
            <div>
              <p className="text-gray-500">Number of Horses</p>
              <p className="font-medium">{shipment.horses.length}</p>
            </div>
          </div>
        )}
      </div>

      {/* ================= SUBMIT OFFER MODAL ================= */}
      {isOfferOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-3">
          <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-[14px] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="relative p-5 border-b">
              <button
                onClick={() => setIsOfferOpen(false)}
                className="absolute right-4 top-4 text-gray-500"
              >
                <FiX size={22} />
              </button>

              <h2 className="text-lg font-semibold">Submit an Offer</h2>
              <p className="text-sm text-gray-500 mt-1">
                Fill out your information to send this buyer an offer.
              </p>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <InputField label="Total Price" type="number" placeholder="$" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Payment Method"
                  options={[
                    { label: "Select", value: "" },
                    { label: "Cash", value: "cash" },
                    { label: "Card", value: "card" },
                    { label: "Bank Transfer", value: "bank" },
                  ]}
                />
                <Select
                  label="Payment Due"
                  options={[
                    { label: "Select", value: "" },
                    { label: "On Pickup", value: "pickup" },
                    { label: "On Delivery", value: "delivery" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Pickup Time" type="time" />
                <InputField label="Est. Arrival Time" type="time" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Transport Type"
                  options={[
                    { label: "Select", value: "" },
                    { label: "Trailer", value: "trailer" },
                    { label: "Truck", value: "truck" },
                  ]}
                />
                <InputField
                  label="Stalls Required"
                  type="number"
                  placeholder="e.g. 2"
                />
              </div>

              <textarea
                rows={3}
                placeholder="Notes"
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#BF9B53]"
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setIsOfferOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => setIsOfferOpen(false)}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentDetails;
