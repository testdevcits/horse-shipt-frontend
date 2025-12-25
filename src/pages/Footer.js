import React from "react";
import { Link } from "react-router-dom"; // import Link
import footerLogo from "../assets/images/footerLogo.png"; // replace with your logo path

const Footer = () => {
  return (
    <footer
      className="w-full bg-white py-2"
      style={{
        height: "135px",
      }}
    >
      {/* Outer Container */}
      <div className="w-full flex justify-center">
        {/* Inner Container */}
        <div className="w-full max-w-[1280px] border-t-2 mt-8 pt-4 flex flex-col md:flex-row items-center justify-between">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <img
              src={footerLogo}
              alt="Logo"
              className="h-32 md:h-24 object-contain"
            />
          </div>

          {/* Right: Copyright & Links */}
          <div className="text-gray-700 text-center md:text-right flex flex-col md:flex-row items-center gap-2">
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>

            {/* Driver Login Link */}
            <Link
              to="/driver/login"
              className="text-blue-600 hover:text-blue-800 underline ml-0 md:ml-4"
            >
              Driver Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
