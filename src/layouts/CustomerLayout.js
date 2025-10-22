import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../pages/customer/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { CgMenu } from "react-icons/cg";
import logo from "../assets/images/logo.png";
import { MdOutlineNotificationsActive } from "react-icons/md";

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false); // desktop toggle
  const [mobileOpen, setMobileOpen] = useState(false); // mobile overlay
  const [profilePopup, setProfilePopup] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white shadow-md px-4 py-3 border-b border-gray-300 lg:px-6">
        {/* Left: Mobile menu + logo */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-200 transition"
            onClick={() => setMobileOpen(true)}
          >
            <CgMenu size={24} />
          </button>
          <img src={logo} alt="Logo" className="w-32 h-auto object-contain" />
        </div>

        {/* Right: Notifications + profile */}
        <div className="flex items-center gap-4 relative">
          <MdOutlineNotificationsActive
            size={20}
            className="text-gray-500 cursor-pointer"
          />
          <div className="relative">
            <img
              src={user?.photo || "https://via.placeholder.com/40"}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover cursor-pointer border border-gray-300"
              onClick={() => setProfilePopup(!profilePopup)}
            />
            {profilePopup && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg">
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

      {/* Layout Body */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Main content */}
        <main
          className={`flex-1 p-4 sm:p-6 md:p-8 overflow-auto transition-all duration-300`}
          style={{
            marginLeft:
              window.innerWidth >= 1024 ? (sidebarOpen ? 256 : 64) : 0,
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
