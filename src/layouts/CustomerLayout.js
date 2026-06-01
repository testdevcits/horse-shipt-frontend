import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../pages/customer/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { CgMenu } from "react-icons/cg";
import { IoMdClose } from "react-icons/io";
import logo from "../assets/images/logo.png";
import { MdOutlineNotificationsActive } from "react-icons/md";
import { useProfile } from "../contexts/customerContext/ProfileContext";
import defaultProfileImage from "../assets/images/profileImage.png";
import StatusBadge from "../components/common/StatusBadge";
import { IoShareSocial } from "react-icons/io5";
import { BiChevronDown } from "react-icons/bi";
import { useNotificationActivity } from "../contexts/NotificationActivityContext";

const CustomerLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile, profileImage, loading } = useProfile();
  const { unreadCount: notificationCount } = useNotificationActivity();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profilePopup, setProfilePopup] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const popupRef = useRef(null)
  const displayedProfileImage =
    (typeof profileImage === "string" ? profileImage : profileImage?.url) ||
    user?.photo ||
    defaultProfileImage;

  const customerName =
    profile?.firstName || profile?.lastName
      ? `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim()
      : user?.name || "User Name";

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
    const handleClickOutside = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target)
      ) {
        setProfilePopup(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm px-4 sm:px-6 lg:px-8 py-3 transition-all duration-300">
        <div className="flex items-center justify-between h-auto gap-3">
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
            className="hidden sm:block h-8 w-auto object-contain"
          />
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <button
            onClick={handleShare}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-system-primary"
            aria-label="Share"
            title="Share"
          >
            <IoShareSocial size={18} />
          </button>

          <button
            onClick={() => navigate("/customer/notifications")}
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

          <div className="hidden sm:block">
            <StatusBadge text="Customer" />
          </div>

          <div className="h-6 w-px bg-gray-200 hidden lg:block mx-1" />

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
                src={displayedProfileImage}
                alt={customerName?.[0] || "U"}
                className="w-8 h-8 rounded-full object-cover border border-gray-300"
                onError={(e) => {
                  e.target.src = defaultProfileImage;
                }}
              />
              <BiChevronDown
                size={18}
                className={`text-gray-600 transition-transform hidden sm:block ${
                  profilePopup ? "rotate-180" : ""
                }`}
              />
            </button>

            {profilePopup && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#BF9B53] rounded-sm shadow-lg z-50 overflow-hidden font-montserrat" ref={popupRef}>
                <div className="px-4 py-4 bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-b border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    Profile
                  </p>

                  <div className="mt-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {customerName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {profile?.email || user?.email || "user@email.com"}
                    </p>
                  </div>
                </div>

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
      <div className="flex flex-1 relative">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <main
          className=" bg-[#F7F5F1] flex-1 p-4 sm:p-6 md:p-8 overflow-auto transition-all duration-300"
          style={{ marginLeft: isDesktop ? (sidebarOpen ? 256 : 80) : 0 }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
