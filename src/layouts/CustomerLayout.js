import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../pages/customer/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { CgMenu } from "react-icons/cg";

const CustomerLayout = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false); // hover controlled

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between bg-white shadow-md px-6 py-3 md:px-8 md:py-4 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <CgMenu size={24} className="text-system-primary" />
          </button>

          {/* Page Title */}
          <h1 className="text-xl font-bold text-system-primary truncate">
            {user?.name || "Customer Dashboard"}
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
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
