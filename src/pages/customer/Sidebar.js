import React from "react";
import { NavLink } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { LuArrowLeftFromLine, LuArrowRightFromLine } from "react-icons/lu";
import { CiCircleQuestion } from "react-icons/ci";
import { FaTachometerAlt, FaBoxOpen, FaCog, FaPlus } from "react-icons/fa";

const navItems = [
  { name: "Dashboard", path: "/customer/dashboard", icon: <FaTachometerAlt /> },
  {
    name: "Orders",
    path: "/customer/orders",
    icon: <FaBoxOpen />,
    subPaths: [
      { name: "Pending", path: "/customer/orders/pending" },
      { name: "Completed", path: "/customer/orders/completed" },
    ],
  },
  { name: "New Shipment", path: "/customer/new-shipment", icon: <FaPlus /> },
  { name: "Settings", path: "/customer/settings", icon: <FaCog /> },
];

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  mobileOpen,
  setMobileOpen,
}) => {
  const isActivePath = (path, subPaths) => {
    if (window.location.pathname === path) return true;
    if (subPaths)
      return subPaths.some((sub) => sub.path === window.location.pathname);
    return false;
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-16 left-0 h-[calc(100%-64px)] bg-white shadow-lg z-50 transform transition-transform duration-300 font-montserrat
          ${
            mobileOpen
              ? "translate-x-0 w-full"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
        style={{ width: sidebarOpen && window.innerWidth >= 1024 ? 256 : 64 }}
      >
        {/* Desktop toggle */}
        <div className="flex justify-end p-4 hidden lg:flex">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? (
              <LuArrowLeftFromLine size={24} />
            ) : (
              <LuArrowRightFromLine size={24} />
            )}
          </button>
        </div>

        {/* Mobile close button */}
        {mobileOpen && (
          <div className="flex justify-end p-4 lg:hidden">
            <button
              onClick={() => setMobileOpen(false)}
              className="text-gray-700 hover:text-gray-900"
            >
              <IoMdClose size={28} />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex flex-col mt-2 h-full overflow-y-auto">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => {
              const active = isActivePath(item.path, item.subPaths);
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 rounded transition-colors duration-300 hover:bg-gray-100 ${
                      active
                        ? "bg-gray-100 font-semibold text-system-primary"
                        : ""
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {sidebarOpen || mobileOpen ? (
                      <span>{item.name}</span>
                    ) : null}
                  </NavLink>

                  {item.subPaths && (sidebarOpen || mobileOpen) && (
                    <ul className="ml-8 mt-1 space-y-1">
                      {item.subPaths.map((sub) => {
                        const subActive = window.location.pathname === sub.path;
                        return (
                          <li key={sub.path}>
                            <NavLink
                              to={sub.path}
                              onClick={() => setMobileOpen(false)}
                              className={`block px-4 py-2 rounded transition-colors duration-300 hover:bg-gray-100 ${
                                subActive
                                  ? "bg-gray-100 font-semibold text-system-primary"
                                  : ""
                              }`}
                            >
                              {sub.name}
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Question Icon */}
        <div className="absolute bottom-4 w-full px-4">
          <button className="flex items-center justify-center w-full py-2 bg-gray-100 hover:bg-gray-200 text-system-primary rounded transition-all duration-300">
            <CiCircleQuestion size={20} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
