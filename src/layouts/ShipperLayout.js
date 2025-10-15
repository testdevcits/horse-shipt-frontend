import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../pages/shipper/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { CgMenu } from "react-icons/cg";

const ShipperLayout = () => {
  const { user } = useAuth(); // removed logout
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(true); // default open

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between bg-white shadow-md px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <CgMenu size={24} className="text-system-primary" />
          </button>

          {/* Page Title */}
          <h1 className="truncate font-bold text-system-primary text-lg sm:text-xl md:text-2xl lg:text-3xl">
            {user?.name || "Shipper Dashboard"}
          </h1>
        </div>

        {/* Desktop Profile */}
        <div className="hidden md:flex items-center gap-3">
          <img
            src={user?.photo || "https://via.placeholder.com/40"}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border border-gray-300"
          />
          <span className="font-medium text-system-primary">{user?.name}</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ShipperLayout;
