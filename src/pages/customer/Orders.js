// src/pages/customer/AllShipments.jsx
import React from "react";
import { FaShippingFast } from "react-icons/fa";

const AllShipments = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-16 px-4 text-center animate-slide-fade-in font-montserrat">
      {/* Icon */}
      <div className="bg-system-primary/10 p-6 rounded-full mb-6">
        <FaShippingFast className="text-system-primary text-4xl sm:text-5xl" />
      </div>

      {/* Heading */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-systemText font-montserrat mb-4">
        All Shipments
      </h1>

      {/* Sub Text */}
      <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-xl">
        We're working on bringing you a complete list of all your shipments.
        This feature will allow you to track and manage every shipment in one
        place.
      </p>

      {/* Coming Soon Badge */}
      <div className="mt-6 px-6 py-2 bg-yellow-100 text-yellow-700 border border-yellow-400 rounded-full text-sm font-medium">
        🚀 Coming Soon
      </div>
    </div>
  );
};

export default AllShipments;
