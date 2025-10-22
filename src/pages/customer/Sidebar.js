import React from "react";
import { NavLink } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { LuArrowRightFromLine, LuArrowLeftFromLine } from "react-icons/lu";
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

const Sidebar = ({ mobileOpen, setMobileOpen, isOpen, setIsOpen }) => {
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
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 z-50 h-[calc(100%-64px)] bg-white shadow-lg transition-all duration-300
          ${isOpen ? "w-64" : "w-16"}
          ${
            mobileOpen
              ? "translate-x-0 w-full"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* Mobile close button */}
        {mobileOpen && (
          <div className="flex justify-end p-4">
            <button
              onClick={() => setMobileOpen(false)}
              className="text-gray-700 hover:text-gray-900"
            >
              <IoMdClose size={28} />
            </button>
          </div>
        )}

        {/* Desktop toggle */}
        {!mobileOpen && (
          <div className="flex justify-end p-4">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? (
                <LuArrowLeftFromLine size={24} />
              ) : (
                <LuArrowRightFromLine size={24} />
              )}
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 mt-2">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => {
              const active = isActivePath(item.path, item.subPaths);
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => mobileOpen && setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 rounded transition-colors duration-300 hover:bg-gray-100 ${
                      active
                        ? "bg-gray-100 font-semibold text-system-primary"
                        : ""
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {isOpen || mobileOpen ? <span>{item.name}</span> : null}
                  </NavLink>

                  {item.subPaths && (isOpen || mobileOpen) && (
                    <ul className="ml-8 mt-1 space-y-1">
                      {item.subPaths.map((sub) => {
                        const subActive = window.location.pathname === sub.path;
                        return (
                          <li key={sub.path}>
                            <NavLink
                              to={sub.path}
                              onClick={() => mobileOpen && setMobileOpen(false)}
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
