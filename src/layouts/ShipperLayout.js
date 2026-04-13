import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../pages/shipper/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { useShipperProfile } from "../contexts/ShipperProfileContext";
import { useShipperPayments } from "../contexts/shipperContext/ShipperPaymentContext";
import { useSubscription } from "../contexts/shipperContext/SubscriptionContext";

import StripeAlertBanner from "../pages/shipper/common/StripeAlertBanner";
import StripeVerificationModal from "../pages/shipper/common/StripeVerificationModal";
import SubscriptionPopup from "../pages/shipper/Subscription/SubscriptionPopup";

import { CgMenu } from "react-icons/cg";
import { IoMdClose } from "react-icons/io";
import { MdOutlineNotificationsActive } from "react-icons/md";
import { IoShareSocial } from "react-icons/io5";

import StatusBadge from "../components/common/StatusBadge";
import logo from "../assets/images/logo.png";
import logo1 from "../assets/images/profileImage.png";
import defaultProfileImage from "../assets/images/profileImage.png";

// =====================================================
// ROUTES that are accessible WITHOUT a subscription
// =====================================================
const SUBSCRIPTION_FREE_ROUTES = ["/shipper/settings"];

const ShipperLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();
  const { profile, loading } = useShipperProfile();
  const { fetchStripeStatus, needsOnboarding } = useShipperPayments();
  const { subscription, loading: subLoading } = useSubscription();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profilePopup, setProfilePopup] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // ── Payment tab detection ──
  const queryParams = new URLSearchParams(location.search);
  const isPaymentTab =
    location.pathname === "/shipper/settings" &&
    queryParams.get("tab") === "payment";

  // ── Subscription status ──
  const isSubscribed =
    subscription && ["active", "trialing"].includes(subscription.status);

  // ── Is current route subscription-free? ──
  const isSubscriptionFreeRoute = SUBSCRIPTION_FREE_ROUTES.some((route) =>
    location.pathname.startsWith(route)
  );

  // ══════════════════════════════════════════════════
  // PRIORITY LOGIC:
  //  1. subLoading → don't block (wait for data)
  //  2. NOT subscribed + NOT free route → show SubscriptionPopup (step 1 must pass first)
  //  3. Subscribed BUT needsOnboarding → show StripeAlertBanner + modal
  // ══════════════════════════════════════════════════

  // Step 1: Block page with subscription popup
  const showSubscriptionBlock =
    !subLoading && !isSubscribed && !isSubscriptionFreeRoute;

  // Step 2: Only show Stripe issues AFTER subscription is confirmed
  const showStripeBanner = isSubscribed && needsOnboarding;

  // ── Profile image ──
  const profileImage =
    profile?.profileImage ||
    user?.profileImage ||
    profile?.profilePicture ||
    user?.profilePicture ||
    defaultProfileImage ||
    logo;

  // ── Screen resize ──
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Fetch Stripe status ──
  useEffect(() => {
    fetchStripeStatus();
  }, [fetchStripeStatus]);

  // ── Auto Stripe modal — only show AFTER subscription confirmed ──
  useEffect(() => {
    if (isSubscribed && needsOnboarding && !isPaymentTab) {
      const hasShown = sessionStorage.getItem("stripeModalShown");
      if (!hasShown) {
        setShowStripeModal(true);
        sessionStorage.setItem("stripeModalShown", "true");
      }
    }
  }, [isSubscribed, needsOnboarding, isPaymentTab]);

  // ── Share ──
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
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* ── Stripe Alert Banner (only if subscribed + needs onboarding) ── */}
      {showStripeBanner && (
        <div className="fixed top-0 left-0 w-full z-50">
          <StripeAlertBanner
            onOpenModal={() => setShowStripeModal(true)}
            hideButton={isPaymentTab}
          />
        </div>
      )}

      {/* ── Header ── */}
      <header
        className={`sticky ${
          showStripeBanner ? "top-[52px]" : "top-0"
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
                  e.target.src = logo1;
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

      {/* ── Body ── */}
      <div
        className={`flex flex-1 relative ${
          showStripeBanner ? "mt-[52px]" : ""
        }`}
      >
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <main
          className="flex-1 overflow-auto transition-all duration-300"
          style={{ marginLeft: isDesktop ? (sidebarOpen ? 256 : 64) : 0 }}
        >
          <div className="p-4 sm:p-6 md:p-8">
            <div className="relative">
              {/* Page content — blurred when subscription is missing */}
              <div
                className={
                  showSubscriptionBlock
                    ? "pointer-events-none select-none blur-sm brightness-75 transition-all duration-300"
                    : ""
                }
              >
                <Outlet />
              </div>

              {/* Lock overlay */}
              {showSubscriptionBlock && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg flex flex-col items-center gap-2 border border-[#BF9B53]/30">
                    <span className="text-2xl">🔒</span>
                    <p className="text-sm font-semibold text-gray-700 text-center">
                      Subscribe to access this page
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Stripe Verification Modal (only if subscribed + needs onboarding) ── */}
      {isSubscribed && (
        <StripeVerificationModal
          isOpen={showStripeModal}
          onClose={() => setShowStripeModal(false)}
        />
      )}

      {/* ── Subscription Popup ──
          Show ONLY when:
          1. User is NOT subscribed
          2. Not on a free route (/shipper/settings)
          3. Subscription data has loaded
      ── */}
      {!subLoading && !isSubscribed && !isSubscriptionFreeRoute && (
        <SubscriptionPopup />
      )}
    </div>
  );
};

export default ShipperLayout;
