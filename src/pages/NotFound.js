import React from "react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 font-montserrat animate-slide-fade-in">
      {/* 404 Big Text */}
      <h1 className="text-[8rem] sm:text-[10rem] md:text-[12rem] font-extrabold text-system-primary mb-6 text-center">
        404
      </h1>

      {/* Title */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-systemText mb-4 text-center">
        Oops! Page Not Found
      </h2>

      {/* Description */}
      <p className="text-paragraph text-gray-500 text-center max-w-md sm:max-w-lg md:max-w-xl mb-8 px-2">
        Sorry, the page you are looking for doesn’t exist, has been removed, or
        had its name changed. Try going back or reloading the page.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => window.history.back()}
          className="px-6 sm:px-8 py-3 bg-light border border-system-primary text-system-primary font-medium rounded-2xl hover:bg-system-primary hover:text-white transition"
        >
          Go Back
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-6 sm:px-8 py-3 bg-light border border-system-primary text-system-primary font-medium rounded-2xl hover:bg-system-primary hover:text-white transition"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

export default NotFound;
