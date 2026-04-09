// src/components/common/Toast.js
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

// Toast component
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
      className={`fixed top-4 right-4 z-[9999] px-4 py-2 rounded-md text-white shadow-lg font-[Montserrat] transition-all duration-300 ${bgColor}`}
    >
      {message}
    </div>
  );
};

// Keep a single toast container in body
let toastContainer = null;

const getToastContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

// Callable API
const Toast = {
  success: (msg, duration) => renderToast(msg, "success", duration),
  error: (msg, duration) => renderToast(msg, "error", duration),
  info: (msg, duration) => renderToast(msg, "info", duration),
  warning: (msg, duration) => renderToast(msg, "warning", duration),
};

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
