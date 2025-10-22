import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../pages/customer/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { CgMenu } from "react-icons/cg";
import logo from "../assets/images/logo.png";
import { MdOutlineNotificationsActive } from "react-icons/md";

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profilePopup, setProfilePopup] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header
          className={`flex items-center justify-between bg-white shadow-md p-3 sm:p-4 md:p-6 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-16"
          }`}
        >
          {/* Left: Menu Button + Logo */}
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
          <div className="flex items-center gap-4 relative">
            <MdOutlineNotificationsActive
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

        {/* Main content */}
        <main
          className={`flex-1 overflow-auto p-2 sm:p-6 md:p-8 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-16"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
