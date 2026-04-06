import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../pages/shipper/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { useShipperProfile } from "../contexts/ShipperProfileContext";
import { useShipperPayments } from "../contexts/shipperContext/ShipperPaymentContext";

import StripeAlertBanner from "../pages/shipper/common/StripeAlertBanner";
import StripeVerificationModal from "../pages/shipper/common/StripeVerificationModal";

import { CgMenu } from "react-icons/cg";
import { IoMdClose } from "react-icons/io";
import { MdOutlineNotificationsActive } from "react-icons/md";
import { IoShareSocial } from "react-icons/io5";

import StatusBadge from "../components/common/StatusBadge";
import logo from "../assets/images/logo.png";
import logo1 from "../assets/images/profileImage.png";

import defaultProfileImage from "../assets/images/profileImage.png";

const ShipperLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();
  const { profile, loading } = useShipperProfile();
  const { fetchStripeStatus, needsOnboarding } = useShipperPayments();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profilePopup, setProfilePopup] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  /* ================= Detect Payment Tab ================= */
  const queryParams = new URLSearchParams(location.search);
  const isPaymentTab =
    location.pathname === "/shipper/settings" &&
    queryParams.get("tab") === "payment";

  /* ================= Profile Image ================= */
  const profileImage =
    profile?.profileImage ||
    user?.profileImage ||
    profile?.profilePicture ||
    user?.profilePicture ||
    defaultProfileImage ||
    logo; // fallback to logo if nothing else

  /* ================= Screen Resize ================= */
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ================= Fetch Stripe Status ================= */
  useEffect(() => {
    fetchStripeStatus();
  }, [fetchStripeStatus]);

  /* ================= Auto Modal Once Per Session ================= */
  useEffect(() => {
    if (needsOnboarding && !isPaymentTab) {
      const hasShown = sessionStorage.getItem("stripeModalShown");
      if (!hasShown) {
        setShowStripeModal(true);
        sessionStorage.setItem("stripeModalShown", "true");
      }
    }
  }, [needsOnboarding, isPaymentTab]);

  const handleShare = async () => {
    const shareData = {
      title: "Check this shipment app",
      text: "Track and manage shipments easily 🚚",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // fallback (desktop)
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* ================= STRIPE ALERT ================= */}
      {needsOnboarding && (
        <div className="fixed top-0 left-0 w-full z-50">
          <StripeAlertBanner
            onOpenModal={() => setShowStripeModal(true)}
            hideButton={isPaymentTab}
          />
        </div>
      )}

      {/* ================= HEADER ================= */}
      <header
        className={`sticky ${
          needsOnboarding ? "top-[52px]" : "top-0"
        } z-40 flex items-center justify-between bg-white shadow-md px-4 py-3 lg:px-6`}
      >
        <div className="flex items-center gap-4">
          {!mobileOpen ? (
            <button
              className="lg:hidden p-2 rounded-md hover:bg-gray-200 transition"
              onClick={() => setMobileOpen(true)}
            >
              <CgMenu size={24} />
            </button>
          ) : (
            <button
              className="lg:hidden p-2 rounded-md hover:bg-gray-200 transition"
              onClick={() => setMobileOpen(false)}
            >
              <IoMdClose size={24} />
            </button>
          )}

          <img
            src={logo}
            alt="Logo"
            className="hidden sm:block w-32 h-auto object-contain"
          />
        </div>

        <div className="flex items-center gap-4 relative">
          <IoShareSocial
            size={20}
            className="text-gray-500 cursor-pointer hover:text-system-primary transition"
            onClick={handleShare}
          />

          <MdOutlineNotificationsActive
            size={20}
            className="text-gray-500 cursor-pointer hover:text-system-primary transition"
            onClick={() => navigate("/shipper/notifications")}
          />

          <StatusBadge text="Shipper account" />

          {profileImage ? (
            <div className="relative">
              <img
                src={profileImage}
                alt={user?.name?.[0] || "U"}
                className={`w-10 h-10 rounded-full object-cover cursor-pointer border border-gray-300 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => !loading && setProfilePopup(!profilePopup)}
                onError={(e) => {
                  e.target.src = logo1; // fallback if broken URL
                }}
              />

              {profilePopup && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                  <div className="px-4 py-2 border-b text-gray-700 font-medium">
                    {user?.name || "User"}
                  </div>

                  <div
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={logout}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300" />
          )}
        </div>
      </header>

      {/* ================= BODY ================= */}
      <div
        className={`flex flex-1 relative ${needsOnboarding ? "mt-[52px]" : ""}`}
      >
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <main
          className="flex-1 overflow-auto transition-all duration-300"
          style={{
            marginLeft: isDesktop ? (sidebarOpen ? 256 : 64) : 0,
          }}
        >
          <div className="p-4 sm:p-6 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ================= STRIPE MODAL ================= */}
      <StripeVerificationModal
        isOpen={showStripeModal}
        onClose={() => setShowStripeModal(false)}
      />
    </div>
  );
};

export default ShipperLayout;
