import React from "react";
import loginBg from "../../assets/images/authPage.jpg";

const PageBanner = ({ title, description, Icon, bottomIcon: BottomIcon }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-90"
        style={{
          backgroundImage: `url(${loginBg})`,
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-800/70 to-slate-900/80" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-[#BF9B53]/20 rounded-full mb-6 border border-[#BF9B53]/30">
          {Icon && <Icon className="w-7 h-7 text-[#BF9B53]" />}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4">
          {title}
        </h1>

        <p className="text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto">
          {description}
        </p>
      </div>
    </div>
  );
};

export default PageBanner;
