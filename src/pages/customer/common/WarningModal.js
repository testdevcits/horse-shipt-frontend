import React from "react";
import { TbInfoSquare } from "react-icons/tb";

const Modal = ({
  title,
  message,
  onClose,
  buttonText = "OK",
  type = "info",
}) => {
  const typeStyles = {
    info: "bg-[#BF9B53] text-white",
    success: "bg-green-100 text-green-600",
    warning: "bg-yellow-100 text-yellow-600",
    error: "bg-red-100 text-red-600",
  };

  const icons = {
    info: <TbInfoSquare />,
    success: "",
    warning: "",
    error: "",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-xl p-6 font-montserrat animate-fade-in">
        {/* Header */}
        <div className="flex items-start gap-3 mb-2">
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-full text-lg ${typeStyles[type]}`}
          >
            {icons[type]}
          </div>

          <div className="flex-1 mt-1">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          </div>
        </div>

        <div className="h-[1px] bg-[#BF9B53] mb-4" />

        <p className="text-sm text-gray-600 leading-relaxed mb-6">{message}</p>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#BF9B53] hover:bg-[#a7863e] text-white px-5 py-2 rounded-md text-sm font-semibold transition-all"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
