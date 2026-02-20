import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "react-router-dom";

const GlobalOfferBanner = () => {
  const { user } = useAuth(); // ya token jo bhi tum use karte ho
  const location = useLocation();

  // ❌ Auth pages par banner mat dikhao
  const hideOnRoutes = ["/login", "/signup", "/oauth-success"];

  if (!user || hideOnRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full bg-yellow-500 text-white text-center py-2 text-sm font-semibold z-[9999]">
      🚛 Special Offer: Get 10% off on your next shipment!
    </div>
  );
};

export default GlobalOfferBanner;
