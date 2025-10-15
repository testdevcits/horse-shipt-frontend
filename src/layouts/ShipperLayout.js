import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../pages/shipper/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { CgMenu } from "react-icons/cg";
import logo from "../assets/images/logo.png";
import {
  HiOutlineBell,
  HiOutlineChatBubbleLeft,
  HiOutlineShare,
} from "react-icons/hi2";

const ShipperLayout = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profilePopup, setProfilePopup] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header
        className={`sticky top-0 z-40 flex items-center justify-between bg-white shadow-md px-4 py-3 lg:px-6 transition-all ${
          mobileMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Left: Logo + Mobile Menu */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-200 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <CgMenu size={24} />
          </button>
          <img src={logo} alt="Logo" className="w-32 h-auto object-contain" />
        </div>

        {/* Right: Profile */}
        <div className="flex items-center gap-4 relative">
          <HiOutlineShare size={20} className="text-gray-500 cursor-pointer" />
          <HiOutlineBell size={20} className="text-gray-500 cursor-pointer" />
          <HiOutlineChatBubbleLeft
            size={20}
            className="text-gray-500 cursor-pointer"
          />
          {/* Profile */}
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

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        {/* Overlay for mobile */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main content */}
        <main
          className={`flex-1 transition-all duration-300 p-4 sm:p-6 md:p-8 ${
            sidebarOpen ? "lg:ml-64" : "lg:ml-20"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ShipperLayout;
