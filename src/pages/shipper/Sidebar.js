import React from "react";
import { NavLink } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { LuArrowRightFromLine, LuArrowLeftFromLine } from "react-icons/lu";
import { FaTachometerAlt, FaBoxOpen, FaUser, FaCog } from "react-icons/fa";
import { CiCircleQuestion } from "react-icons/ci";

const navItems = [
  { name: "Dashboard", path: "/shipper/dashboard", icon: <FaTachometerAlt /> },
  {
    name: "Orders",
    path: "/shipper/orders",
    icon: <FaBoxOpen />,
    subPaths: [
      { name: "Pending", path: "/shipper/orders/pending" },
      { name: "Completed", path: "/shipper/orders/completed" },
    ],
  },
  { name: "Profile", path: "/shipper/profile", icon: <FaUser /> },
  { name: "Settings", path: "/shipper/settings", icon: <FaCog /> },
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
        className={`fixed top-0 left-0 z-50 h-full bg-white text-system-primary shadow-lg transition-transform duration-300
          md:relative md:h-auto md:shadow-none
          ${isOpen ? "w-64" : "w-16"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Top buttons (toggle / mobile close) */}
        <div className="flex justify-end p-4">
          {mobileOpen ? (
            <button
              onClick={() => setMobileOpen(false)}
              className="text-gray-700 hover:text-gray-900"
            >
              <IoMdClose size={28} />
            </button>
          ) : (
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? (
                <LuArrowLeftFromLine size={24} />
              ) : (
                <LuArrowRightFromLine size={24} />
              )}
            </button>
          )}
        </div>

        {/* Scrollable nav items */}
        <nav className="flex-1 overflow-y-auto px-2">
          <ul className="space-y-2">
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
                    {(isOpen || mobileOpen) && <span>{item.name}</span>}
                  </NavLink>

                  {/* Subpaths */}
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

        {/* Bottom fixed button */}
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
