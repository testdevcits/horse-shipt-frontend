// src/components/common/Toast.js
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

const ToastComponent = ({
  message,
  type = "info",
  duration = 3000,
  onClose,
}) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onClose && onClose();
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
      className={`fixed top-4 font-[Montserrat] right-4 z-[9999] px-4 py-2 rounded-md text-white shadow-lg ${bgColor}`}
    >
      {message}
    </div>
  );
};

// Callable API
const Toast = {
  success: (msg, duration) => renderToast(msg, "success", duration),
  error: (msg, duration) => renderToast(msg, "error", duration),
  info: (msg, duration) => renderToast(msg, "info", duration),
  warning: (msg, duration) => renderToast(msg, "warning", duration),
};

const renderToast = (message, type, duration = 3000) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  const cleanup = () => {
    root.unmount();
    document.body.removeChild(container);
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
