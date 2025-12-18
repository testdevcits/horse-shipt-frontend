import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom"; // added useNavigate
import Sidebar from "../pages/shipper/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { useShipperProfile } from "../contexts/ShipperProfileContext";
import { CgMenu } from "react-icons/cg";
import { IoMdClose } from "react-icons/io";
import logo from "../assets/images/logo.png";
import { MdOutlineNotificationsActive } from "react-icons/md";
import { IoShareSocial } from "react-icons/io5";

const ShipperLayout = () => {
  const navigate = useNavigate(); // initialize navigate
  const { user, logout } = useAuth();
  const { profile, loading } = useShipperProfile();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profilePopup, setProfilePopup] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  const profileImage =
    profile?.profileImage ||
    user?.profileImage ||
    profile?.profilePicture ||
    user?.profilePicture ||
    null;

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white shadow-md px-4 py-3 lg:px-6">
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
          {/* Share Icon */}
          <IoShareSocial size={20} className="text-gray-500 cursor-pointer" />

          {/* Notification Icon → Navigate */}
          <MdOutlineNotificationsActive
            size={20}
            className="text-gray-500 cursor-pointer hover:text-system-primary transition"
            onClick={() => navigate("/shipper/notifications")}
          />

          {/* Chat Status */}
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-full 
    bg-success-700 border border-success-600"
          >
            <span className="w-2 h-2 bg-success-400 rounded-full"></span>
            <span className="text-white text-xs font-medium">Available</span>
          </div>

          {/* Profile */}
          {profileImage ? (
            <div className="relative">
              <img
                src={profileImage}
                alt="Profile"
                className={`w-10 h-10 rounded-full object-cover cursor-pointer border border-gray-300 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => !loading && setProfilePopup(!profilePopup)}
              />

              {/* Profile Dropdown */}
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
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300" />
          )}
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
          style={{
            marginLeft: isDesktop ? (sidebarOpen ? 256 : 64) : 0,
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ShipperLayout;
