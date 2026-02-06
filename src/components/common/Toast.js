import React, { useEffect, useState } from "react";

const Toast = ({ message, type = "info", duration = 3000, onClose }) => {
  const [show, setShow] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => {
        setShow(false);
        onClose && onClose();
      }, 300); // matches slide-out duration
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!show) return null;

  const bgColor = {
    info: "bg-[#BF9B53]",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  }[type];

  return (
    <div
      className={`fixed top-4 right-4 sm:top-5 sm:right-5 z-50 max-w-xs w-[90%] sm:w-auto px-4 py-2 rounded-md text-white shadow-lg break-words ${bgColor} ${
        leaving ? "animate-slide-out-right" : "animate-slide-in-right"
      }`}
    >
      <div className="flex justify-between items-center">
        <span className="text-sm sm:text-base">{message}</span>
        <button
          onClick={() => setLeaving(true)}
          className="ml-2 text-white font-bold px-2 py-1 rounded hover:bg-white/20"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
