import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LuArrowRightFromLine, LuArrowLeftFromLine } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";
import { FaTachometerAlt, FaBoxOpen, FaUser } from "react-icons/fa";

const navItems = [
  {
    name: "Dashboard",
    path: "/shipper/dashboard",
    icon: <FaTachometerAlt />,
  },
  {
    name: "Orders",
    path: "/shipper/orders",
    icon: <FaBoxOpen />,
    subPaths: [
      { name: "Pending", path: "/shipper/orders/pending" },
      { name: "Completed", path: "/shipper/orders/completed" },
    ],
  },
  {
    name: "Profile",
    path: "/shipper/profile",
    icon: <FaUser />,
  },
];

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true); // Desktop toggle

  const isActivePath = (path, subPaths) => {
    if (location.pathname === path) return true;
    if (subPaths) return subPaths.some((sub) => sub.path === location.pathname);
    return false;
  };

  return (
    <>
      {/* Mobile Full-Screen Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-full bg-white text-system-primary shadow-lg transition-transform duration-300
        md:relative md:translate-x-0 ${isOpen ? "w-64" : "w-20"}
        ${mobileOpen ? "translate-x-0 w-full" : "-translate-x-full"}`}
      >
        {/* Close Button */}
        <div className="flex justify-end p-4 md:hidden">
          <button
            onClick={() => setMobileOpen(false)}
            className="text-system-primary"
          >
            <IoMdClose size={28} />
          </button>
        </div>

        {/* Desktop Toggle */}
        <div className="hidden md:flex justify-end p-2">
          <button
            className="text-system-primary hover:text-accent transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <LuArrowLeftFromLine size={20} />
            ) : (
              <LuArrowRightFromLine size={20} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const active = isActivePath(item.path, item.subPaths);
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => mobileOpen && setMobileOpen(false)} // close mobile on click
                    className={`flex items-center gap-3 px-6 py-3 rounded transition-colors duration-300 ${
                      active
                        ? "bg-gray-100 text-system-primary font-semibold"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {isOpen || mobileOpen ? <span>{item.name}</span> : null}
                  </NavLink>

                  {/* Subpaths */}
                  {item.subPaths && (isOpen || mobileOpen) && (
                    <ul className="ml-12 mt-1 space-y-1">
                      {item.subPaths.map((sub) => {
                        const subActive = location.pathname === sub.path;
                        return (
                          <li key={sub.path}>
                            <NavLink
                              to={sub.path}
                              onClick={() => mobileOpen && setMobileOpen(false)} // close mobile on click
                              className={`block px-4 py-2 rounded transition-colors duration-300 ${
                                subActive
                                  ? "bg-gray-100 text-system-primary font-semibold"
                                  : "hover:bg-gray-50"
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
      </div>
    </>
  );
};

export default Sidebar;
