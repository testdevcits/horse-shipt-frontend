import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../pages/customer/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { CgMenu } from "react-icons/cg";
import { HiOutlineChatBubbleLeft, HiOutlineBell } from "react-icons/hi2";
import { HiOutlineShare } from "react-icons/hi";
import logo from "../assets/images/logo.png";

const CustomerLayout = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-16"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-white shadow-md px-4 py-3 lg:px-6">
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

          {/* Right: Icons + Profile */}
          <div className="flex items-center gap-4">
            {/* Chat Icon */}
            <button className="p-2 rounded-md hover:bg-gray-200 transition text-system-primary">
              <HiOutlineChatBubbleLeft size={24} />
            </button>

            {/* Notification Icon */}
            <button className="p-2 rounded-md hover:bg-gray-200 transition text-system-primary">
              <HiOutlineBell size={24} />
            </button>

            {/* Share Icon */}
            <button className="p-2 rounded-md hover:bg-gray-200 transition text-system-primary">
              <HiOutlineShare size={24} />
            </button>

            {/* Profile */}
            <div className="relative">
              <img
                src={user?.photo || "https://via.placeholder.com/40"}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover cursor-pointer border border-gray-300"
              />
              {/* Profile dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg hidden group-hover:block">
                <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Profile
                </div>
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    // logout function
                  }}
                >
                  Logout
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
