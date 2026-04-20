import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";

// Toast component
const ToastComponent = ({
  message,
  type = "info",
  duration = 3000,
  onClose,
}) => {
  const [show, setShow] = useState(true);

  const handleClose = useCallback(() => {
    setShow(false);
    if (onClose) onClose();
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  if (!show) return null;

  const bgColor = {
    info: "bg-[#BF9B53]",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  }[type];

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 px-3 py-2 rounded-sm text-white shadow-lg font-[Montserrat] transition-all duration-300 ${bgColor}`}
    >
      {/* Message */}
      <span className="text-xs">{message}</span>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="text-white text-sm font-bold hover:opacity-80"
      >
        ✕
      </button>
    </div>
  );
};

// ---------------- Container ----------------
let toastContainer = null;

const getToastContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

// ---------------- API ----------------
const Toast = {
  success: (msg, duration) => renderToast(msg, "success", duration),
  error: (msg, duration) => renderToast(msg, "error", duration),
  info: (msg, duration) => renderToast(msg, "info", duration),
  warning: (msg, duration) => renderToast(msg, "warning", duration),
};

// ---------------- Render Function ----------------
const renderToast = (message, type, duration = 3000) => {
  const container = getToastContainer();
  const toastRoot = document.createElement("div");
  container.appendChild(toastRoot);

  const root = createRoot(toastRoot);

  const cleanup = () => {
    root.unmount();
    container.removeChild(toastRoot);
  };

  root.render(
    <ToastComponent
      message={message}
      type={type}
      duration={duration}
      onClose={cleanup}
    />
  );
};

export default Toast;
