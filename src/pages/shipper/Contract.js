import React from "react";
import comingSoonImg from "../../assets/images/defultlogo.png";

const ContractsComingSoon = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center px-4 py-20 animate-slide-fade-in">
      {/* Image */}
      <img
        src={comingSoonImg}
        alt="Coming Soon"
        className="w-[52px] sm:w-[52px] mb-6 object-contain"
      />

      {/* Heading */}
      <h2 className="w-full text-[24px] sm:text-[28px] font-semibold text-[#4B5563] mb-4">
        Coming Soon
      </h2>

      {/* Description */}
      <p className="text-gray-600 text-[15px] sm:text-[16px] leading-relaxed max-w-md">
        Stay tuned for the latest enhancements coming soon to the Contracts
        page. You will be able to upload and manage contracts here.
      </p>
    </div>
  );
};

export default ContractsComingSoon;
