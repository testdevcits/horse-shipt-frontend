import React, { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { CgMenu, CgClose } from "react-icons/cg";
import logo from "../assets/images/logo.png";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  const toggleMenu = () => {
    if (menuOpen) {
      setMenuOpen(false);
      setTimeout(() => setVisible(false), 300);
    } else {
      setVisible(true);
      setTimeout(() => setMenuOpen(true), 10);
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setTimeout(() => setVisible(false), 300);
  };

  const goToHomeSection = (sectionId) => {
    closeMenu();

    if (location.pathname === "/") {
      window.requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
      return;
    }

    navigate(`/#${sectionId}`);
  };

  return (
    <header className="bg-header sticky top-0 z-50 font-montserrat">
      <div className="max-w-full mx-auto px-4 py-3 flex justify-between items-center">
        {/* LEFT */}
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            {logo ? (
              <img src={logo} alt="Logo" className="h-8 w-auto" />
            ) : (
              <span className="text-xl font-bold text-dark">MyWebsite</span>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-6">
            <button
              onClick={() => goToHomeSection("solutions")}
              className="text-dark font-medium hover:text-gray-600"
            >
              Solutions
            </button>

            {/* <NavLink
              to="/features"
              className={({ isActive }) =>
                `text-dark font-medium hover:text-gray-600 ${
                  isActive
                    ? "underline underline-offset-4 decoration-system-primary"
                    : ""
                }`
              }
            >
              Features
            </NavLink> */}

              <button
              onClick={() => goToHomeSection("features")}
              className="text-dark font-medium hover:text-gray-600"
            >
            Features
            </button>

            <NavLink
              to="/privacy-policy"
              className={({ isActive }) =>
                `text-dark font-medium hover:text-gray-600 ${
                  isActive
                    ? "underline underline-offset-4 decoration-system-primary"
                    : ""
                }`
              }
            >
              Privacy Policy
            </NavLink>

            <NavLink
              to="/terms-conditions"
              className={({ isActive }) =>
                `text-dark font-medium hover:text-gray-600 ${
                  isActive
                    ? "underline underline-offset-4 decoration-system-primary"
                    : ""
                }`
              }
            >
              Terms & Conditions
            </NavLink>
          </nav>
        </div>

        {/* RIGHT */}
        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="hidden md:inline-block bg-white text-system-primary border border-system-primary px-5 py-2 rounded-full font-medium hover:bg-system-primary hover:text-white transition"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="hidden md:inline-block bg-system-primary text-white px-5 py-2 rounded-full font-medium hover:bg-opacity-90 transition"
          >
            Sign Up
          </Link>

          <button onClick={toggleMenu} className="md:hidden text-dark text-2xl">
            {menuOpen ? <CgClose /> : <CgMenu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {visible && (
        <div
          className={`md:hidden w-full bg-header shadow-md overflow-hidden ${
            menuOpen ? "animate-slide-fade-in" : "animate-slide-fade-out"
          }`}
        >
          <nav className="flex flex-col px-4 py-3 space-y-3">
            <button
              type="button"
              onClick={() => goToHomeSection("solutions")}
              className="py-2 text-dark"
            >
              Solutions
            </button>

            <button
              type="button"
              onClick={() => goToHomeSection("features")}
              className="py-2 text-dark"
            >
              Features
            </button>

            <NavLink
              to="/privacy-policy"
              onClick={toggleMenu}
              className="py-2 text-dark"
            >
              Privacy Policy
            </NavLink>

            <NavLink
              to="/terms-conditions"
              onClick={toggleMenu}
              className="py-2 text-dark"
            >
              Terms & Conditions
            </NavLink>

            <Link
              to="/login"
              onClick={toggleMenu}
              className="py-2 bg-white text-system-primary text-center rounded-full border border-system-primary hover:bg-system-primary hover:text-white transition"
            >
              Login
            </Link>

            <Link
              to="/signup"
              onClick={toggleMenu}
              className="py-2 bg-system-primary text-white text-center rounded-full"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
