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
      className={`fixed top-5 right-5 z-50 px-4 py-2 rounded-md text-white shadow-lg ${bgColor} ${
        leaving ? "animate-slide-out-right" : "animate-slide-in-right"
      }`}
    >
      {message}
      <button
        onClick={() => setLeaving(true)}
        className="ml-2 text-white font-bold px-1 py-0.5 rounded hover:bg-white/20"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
