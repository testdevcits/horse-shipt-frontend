import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../pages/shipper/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { CgMenu } from "react-icons/cg";

const ShipperLayout = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between bg-white shadow-md px-6 py-3 md:px-8 md:py-4">
        <h1 className="text-xl font-bold text-system-primary truncate">
          {user?.name || "Shipper Dashboard"}
        </h1>
        <div className="flex items-center gap-4 md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <CgMenu size={24} className="text-system-primary" />
          </button>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <span className="text-system-primary font-medium">{user?.name}</span>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
        />

        {/* Main content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ShipperLayout;
