import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../pages/customer/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { useCustomerNotifications } from "../contexts/CustomerNotificationContext";
import { CgMenu } from "react-icons/cg";
import { IoMdClose } from "react-icons/io";
import logo from "../assets/images/logo.png";
import { MdOutlineNotificationsActive } from "react-icons/md";
import { useProfile } from "../contexts/customerContext/ProfileContext";
import defaultProfileImage from "../assets/images/profileImage.png";

const CustomerLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notificationCount } = useCustomerNotifications();
  const { profileImage } = useProfile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profilePopup, setProfilePopup] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Use profile image from context or fallback to user.photo
  const displayedProfileImage =
    profileImage || user?.photo || defaultProfileImage;

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white shadow-md px-4 py-3 border-b border-gray-300 lg:px-6">
        {/* Left */}
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

        {/* Right */}
        <div className="flex items-center gap-4 relative">
          {/* Notification Bell */}
          <div
            className="relative cursor-pointer"
            onClick={() => navigate("/customer/notifications")}
          >
            <MdOutlineNotificationsActive
              size={24}
              className="text-gray-500 hover:text-system-primary transition"
            />
            {notificationCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {notificationCount}
              </span>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <img
              src={displayedProfileImage} // <-- now reactive to context changes
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover cursor-pointer border border-gray-300"
              onClick={() => setProfilePopup(!profilePopup)}
            />
            {profilePopup && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                <div className="px-4 py-2 border-b text-gray-700 font-medium">
                  {user?.name || "User"}
                </div>
                <div
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={logout}
                >
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 relative">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <main
          className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto transition-all duration-300"
          style={{ marginLeft: isDesktop ? (sidebarOpen ? 256 : 64) : 0 }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
