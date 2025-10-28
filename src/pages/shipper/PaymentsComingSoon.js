import React from "react";
import comingSoonImg from "../../assets/images/defultlogo.png";
const PaymentsComingSoon = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      {/* Heading */}
      <h2 className="text-[24px] sm:text-[28px] font-semibold text-gray-800 mb-4">
        Coming Soon
      </h2>

      {/* Image */}
      <img
        src={comingSoonImg}
        alt="Coming Soon"
        className="w-[220px] sm:w-[300px] mb-6 object-contain"
      />

      {/* Description */}
      <p className="text-gray-600 text-[15px] sm:text-[16px] max-w-[420px] leading-relaxed">
        Stay tuned for the latest enhancements coming soon to the Payments page.
      </p>
    </div>
  );
};

export default PaymentsComingSoon;
