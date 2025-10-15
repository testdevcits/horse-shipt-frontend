import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../pages/shipper/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { CgMenu } from "react-icons/cg";

const ShipperLayout = () => {
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
        <header
          className={`sticky top-0 z-50 flex items-center justify-between bg-white shadow-md px-4 py-3 lg:px-6 transition-all duration-300 ${
            sidebarOpen ? "lg:pl-6" : "lg:pl-4"
          }`}
        >
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 rounded-md hover:bg-gray-200 transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <CgMenu size={24} />
            </button>
            <h1 className="truncate font-bold text-system-primary text-lg sm:text-xl md:text-2xl lg:text-3xl">
              {user?.name || "Shipper Dashboard"}
            </h1>
          </div>

          {/* Desktop Profile */}
          <div className="hidden lg:flex items-center gap-3">
            <img
              src={user?.photo || "https://via.placeholder.com/40"}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border border-gray-300"
            />
            <span className="font-medium text-system-primary">
              {user?.name}
            </span>
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

export default ShipperLayout;
