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
import { BiChevronDown } from "react-icons/bi";

import StatusBadge from "../components/common/StatusBadge";
import logo from "../assets/images/HorseShipt 1.svg";
import logo1 from "../assets/images/profileImage.png";
import defaultProfileImage from "../assets/images/profileImage.png";
import {
  fetchNotificationActivity,
  loadNotificationActivity,
} from "../utils/notificationActivity";

const ShipperLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, token, logout } = useAuth();
  const { profile, loading } = useShipperProfile();
  const { fetchStripeStatus, needsOnboarding } = useShipperPayments();
  const { subscription, loading: subLoading } = useSubscription();

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profilePopup, setProfilePopup] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [notificationCount, setNotificationCount] = useState(0);

  const queryParams = new URLSearchParams(location.search);
  const isPaymentTab =
    location.pathname === "/shipper/settings" &&
    queryParams.get("tab") === "payment";

  const isSubscribed =
    subscription && ["active", "trialing"].includes(subscription.status);

  const showStripeBanner = isSubscribed && needsOnboarding;

  const profileImage =
    profile?.profileImage ||
    user?.profileImage ||
    profile?.profilePicture ||
    user?.profilePicture ||
    defaultProfileImage ||
    logo;

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setSidebarOpen(isDesktop);
    if (isDesktop) {
      setMobileOpen(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    const loadCount = async () => {
      const activity = loadNotificationActivity({
        role: user?.role,
        userId: user?._id,
      });
      setNotificationCount(activity.filter((item) => !item.read).length);

      if (!user?.role || !user?._id || !token) return;

      try {
        const result = await fetchNotificationActivity({
          role: user.role,
          userId: user._id,
          token,
        });
        setNotificationCount(result.unreadCount);
      } catch {
        // Local activity count is already shown as fallback.
      }
    };

    loadCount();
    window.addEventListener("horse_shipt:notification_activity", loadCount);
    return () =>
      window.removeEventListener("horse_shipt:notification_activity", loadCount);
  }, [token, user?._id, user?.role]);

  useEffect(() => {
    fetchStripeStatus();
  }, [fetchStripeStatus]);

  useEffect(() => {
    if (isSubscribed && needsOnboarding && !isPaymentTab) {
      const hasShown = sessionStorage.getItem("stripeModalShown");
      if (!hasShown) {
        setShowStripeModal(true);
        sessionStorage.setItem("stripeModalShown", "true");
      }
    }
  }, [isSubscribed, needsOnboarding, isPaymentTab]);

  const handleShare = async () => {
    const shareData = {
      title: "Check this shipment app",
      text: "Track and manage shipments easily",
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

  const handleLogout = () => {
    logout();
    setProfilePopup(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* STRIPE ALERT BANNER */}
      {showStripeBanner && (
        <div className="fixed top-0 left-0 w-full z-50">
          <StripeAlertBanner
            onOpenModal={() => setShowStripeModal(true)}
            hideButton={isPaymentTab}
          />
        </div>
      )}

      {/* HEADER */}
      <header
        className={`sticky ${
          showStripeBanner ? "top-[44px]" : "top-0"
        } z-40 bg-white border-b border-gray-200 shadow-sm px-4 sm:px-6 lg:px-8 py-3 transition-all duration-300`}
      >
        <div className="flex items-center justify-between h-auto gap-3">
          {/* LEFT - MENU & LOGO */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <IoMdClose size={22} className="text-gray-800" />
              ) : (
                <CgMenu size={22} className="text-gray-800" />
              )}
            </button>

            <img
              src={logo}
              alt="Logo"
              className="h-8 w-auto object-contain hidden sm:block"
            />
          </div>

          {/* RIGHT - ACTIONS & PROFILE */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Share button */}
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-system-primary"
              aria-label="Share"
              title="Share"
            >
              <IoShareSocial size={18} />
            </button>

            {/* Notifications button */}
            <button
              onClick={() => navigate("/shipper/notifications")}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-system-primary"
              aria-label="Notifications"
              title="Notifications"
            >
              <MdOutlineNotificationsActive size={18} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#BF9B53] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Status badge - hidden on mobile */}
            <div className="hidden sm:block">
              <StatusBadge text="Shipper" />
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200 hidden lg:block mx-1" />

            {/* Profile section */}
            <div className="relative">
              <button
                onClick={() => !loading && setProfilePopup(!profilePopup)}
                disabled={loading}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title="Profile"
              >
                <img
                  src={profileImage}
                  alt={user?.name?.[0] || "U"}
                  className="w-8 h-8 rounded-full object-cover border border-gray-300"
                  onError={(e) => {
                    e.target.src = logo1;
                  }}
                />
                <BiChevronDown
                  size={18}
                  className={`text-gray-600 transition-transform hidden sm:block ${
                    profilePopup ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown */}
              {profilePopup && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#BF9B53] rounded-sm shadow-lg z-50 overflow-hidden font-montserrat">
                  {/* Header */}
                  <div className="px-4 py-4 bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-b border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Profile
                    </p>

                    <div className="mt-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user?.name || "User Name"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email || "user@email.com"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div
        className={`flex flex-1 relative ${
          showStripeBanner ? "mt-[44px]" : ""
        }`}
      >
        {/* SIDEBAR */}
        <div className="relative">
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />
        </div>

        {/* MAIN CONTENT */}
        <main
          className="flex-1 overflow-auto transition-all duration-300"
          style={{
            marginLeft: isDesktop ? (sidebarOpen ? "256px" : "64px") : "0",
          }}
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* MODALS */}
      {isSubscribed && (
        <StripeVerificationModal
          isOpen={showStripeModal}
          onClose={() => setShowStripeModal(false)}
        />
      )}

      {!subLoading && !isSubscribed && <SubscriptionPopup />}
    </div>
  );
};

export default ShipperLayout;
