import React from "react";

const Modal = ({ title, message, onClose, buttonText = "OK" }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6 animate-slide-down font-montserrat">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-systemText">{title}</h2>
        </div>

        <div className="w-full h-[1px] bg-gray-200 mb-4" />

        <p className="text-sm text-gray-600 leading-5 mb-6">{message}</p>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-system-primary text-white px-6 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
