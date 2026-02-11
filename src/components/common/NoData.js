// src/components/common/NoData.jsx
import React from "react";
import comingSoonImg from "../../assets/images/defultlogo.png";

const NoData = ({
  title = "No Data Found",
  description = "There is currently no data to display.",
  showGoBack = true,
  showReload = true,
}) => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 font-montserrat animate-slide-fade-in">
      {/* Big Icon/Text */}
      <img
        src={comingSoonImg}
        alt="Coming Soon"
        className="w-[52px] sm:w-[52px] mb-6 object-contain"
      />

      {/* Title */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-systemText mb-4 text-center">
        {title}
      </h2>

      {/* Description */}
      <p className="text-paragraph text-gray-500 text-center max-w-md sm:max-w-lg md:max-w-xl mb-8 px-2">
        {description}
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {showGoBack && (
          <button
            onClick={() => window.history.back()}
            className="px-6 sm:px-8 py-3 bg-light border border-system-primary text-system-primary font-medium rounded-2xl hover:bg-system-primary hover:text-white transition"
          >
            Go Back
          </button>
        )}
        {showReload && (
          <button
            onClick={() => window.location.reload()}
            className="px-6 sm:px-8 py-3 bg-light border border-system-primary text-system-primary font-medium rounded-2xl hover:bg-system-primary hover:text-white transition"
          >
            Reload Page
          </button>
        )}
      </div>
    </div>
  );
};

export default NoData;
