import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../pages/customer/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { CgMenu } from "react-icons/cg";
import { HiOutlineChatBubbleLeft, HiOutlineBell } from "react-icons/hi2";
import { HiOutlineShare } from "react-icons/hi";
import logo from "../assets/images/logo.png";

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profilePopup, setProfilePopup] = useState(false);

  // Sidebar width
  const sidebarWidth = sidebarOpen ? 256 : 64; // 64px = 16rem, 256px = 64rem

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-white shadow-md px-4 py-3 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-200 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <CgMenu size={24} />
          </button>
          <img src={logo} alt="Logo" className="w-32 h-auto object-contain" />
        </div>

        <div className="flex items-center gap-4 relative">
          <HiOutlineShare size={20} className="text-gray-500 cursor-pointer" />
          <HiOutlineBell size={20} className="text-gray-500 cursor-pointer" />
          <HiOutlineChatBubbleLeft
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
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar (fixed) */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main content */}
      <main
        className="overflow-auto min-h-[calc(100vh-64px)] pt-4 pb-8 px-4 sm:px-6 md:px-8"
        style={{ marginLeft: sidebarOpen ? 256 : 64 }} // push main content
      >
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
