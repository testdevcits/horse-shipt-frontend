import React from "react";
import logo from "../../assets/images/defultlogo.png"; // <-- replace with your logo path

const ModalOfferPublished = ({
  isOpen,
  onClose,
  onViewShipments,
  onAnotherAction,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 font-montserrat">
      <div
        className="bg-white rounded-[12px] w-[343px] h-[372px] p-4 flex flex-col justify-between"
        style={{
          boxShadow: "0px 8px 8px -4px #10182808, 0px 20px 24px -4px #10182814",
        }}
      >
        {/* Logo */}
        <div className="flex justify-center mt-2">
          <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
        </div>

        {/* Heading */}
        <h2 className="text-center text-lg font-semibold mt-2">
          Your shipment request has been published
        </h2>

        {/* Paragraph */}
        <p className="text-center text-sm text-gray-600 mt-2">
          To view detailed information about the shipment and quotes received,
          please visit “My Shipments” page.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={onViewShipments}
            className="w-full py-2 bg-[#BF9B53] text-white rounded-md hover:bg-green-700 transition"
          >
            Go to My Shipments
          </button>
          <button
            onClick={onAnotherAction}
            className="w-full py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalOfferPublished;
