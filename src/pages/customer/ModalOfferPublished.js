import React from "react";
import logo from "../../assets/images/defultlogo.png"; // <-- replace with your logo path

const ModalOfferPublished = ({ isOpen, onViewShipments, onAnotherAction }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 font-montserrat">
      <div
        className="bg-gray-100 rounded-md max-w-md h-[372px] p-4 flex flex-col justify-between"
        style={{
          boxShadow: "0px 8px 8px -4px #10182808, 0px 20px 24px -4px #10182814",
        }}
      >
        {/* Logo */}
        <div className="flex justify-center">
          <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
        </div>

        {/* Heading */}
        <h2 className="text-center text-lg font-semibold">
          Your Shipment is in Draft
        </h2>

        {/* Paragraph */}
        <p className="text-center text-sm text-gray-600">
          You have successfully added a new shipment, but it is still in draft.
          Please review the details and publish it to make it active and visible
          to service providers.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <button
            onClick={onViewShipments}
            className="w-full py-2 bg-[#BF9B53] text-white rounded-sm hover:bg-[#a7863e] transition"
          >
            Review & Publish
          </button>
          <button
            onClick={onAnotherAction}
            className="w-full py-2 bg-gray-200 text-gray-700 rounded-sm hover:bg-gray-300 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalOfferPublished;
